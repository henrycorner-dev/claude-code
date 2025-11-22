<!--
Example: Nuxt 3 SSR with Composables, Server Routes, and State Management
This example demonstrates a dashboard page with data fetching, auth, and real-time updates
-->

<!-- pages/dashboard.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Types
interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface DashboardStats {
  totalUsers: number
  totalPosts: number
  totalRevenue: number
  growthRate: number
}

interface Activity {
  id: string
  type: 'user_signup' | 'post_created' | 'payment_received'
  description: string
  timestamp: string
}

// Composables
const { user, logout } = useAuth()
const route = useRoute()
const router = useRouter()

// Meta tags
useHead({
  title: 'Dashboard',
  meta: [
    { name: 'description', content: 'User dashboard with stats and activities' }
  ]
})

// Middleware - protect this route
definePageMeta({
  middleware: 'auth'
})

// Fetch dashboard data (SSR + client hydration)
const { data: stats, pending: statsPending, error: statsError } = await useFetch<DashboardStats>(
  '/api/dashboard/stats',
  {
    // Cache key for deduplication
    key: 'dashboard-stats',

    // Transform response
    transform: (data) => ({
      ...data,
      totalRevenue: Number(data.totalRevenue).toFixed(2)
    }),

    // Watch route params for refetch
    watch: [() => route.query.period]
  }
)

// Lazy fetch activities (won't block navigation)
const {
  data: activities,
  pending: activitiesPending,
  refresh: refreshActivities
} = await useLazyFetch<Activity[]>('/api/dashboard/activities', {
  key: 'dashboard-activities'
})

// Local state for real-time updates
const realtimeActivities = ref<Activity[]>([])

// Computed properties
const allActivities = computed(() => {
  return [...realtimeActivities.value, ...(activities.value || [])]
})

const formattedStats = computed(() => {
  if (!stats.value) return null

  return {
    users: {
      value: stats.value.totalUsers.toLocaleString(),
      label: 'Total Users',
      icon: 'mdi:account-group'
    },
    posts: {
      value: stats.value.totalPosts.toLocaleString(),
      label: 'Total Posts',
      icon: 'mdi:file-document'
    },
    revenue: {
      value: `$${stats.value.totalRevenue}`,
      label: 'Total Revenue',
      icon: 'mdi:currency-usd'
    },
    growth: {
      value: `${stats.value.growthRate}%`,
      label: 'Growth Rate',
      icon: 'mdi:trending-up',
      positive: stats.value.growthRate > 0
    }
  }
})

// WebSocket connection for real-time updates
const ws = ref<WebSocket | null>(null)

onMounted(() => {
  if (import.meta.client) {
    // Connect to WebSocket (client-side only)
    ws.value = new WebSocket('wss://api.example.com/dashboard')

    ws.value.onmessage = (event) => {
      const activity = JSON.parse(event.data)
      realtimeActivities.value.unshift(activity)

      // Keep only last 10 real-time activities
      if (realtimeActivities.value.length > 10) {
        realtimeActivities.value = realtimeActivities.value.slice(0, 10)
      }
    }

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (ws.value) {
    ws.value.close()
  }
})

// Methods
const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'user_signup':
      return 'mdi:account-plus'
    case 'post_created':
      return 'mdi:file-document-plus'
    case 'payment_received':
      return 'mdi:cash-check'
    default:
      return 'mdi:information'
  }
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}
</script>

<template>
  <div class="dashboard max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
        <p class="text-gray-600">Welcome back, {{ user?.name }}!</p>
      </div>

      <button
        @click="handleLogout"
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Logout
      </button>
    </header>

    <!-- Stats Grid -->
    <section class="mb-8">
      <div v-if="statsPending" class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Loading skeletons -->
        <div
          v-for="i in 4"
          :key="i"
          class="bg-white rounded-lg shadow p-6 animate-pulse"
        >
          <div class="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div class="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      <div
        v-else-if="statsError"
        class="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <p class="text-red-700">Failed to load stats</p>
      </div>

      <div
        v-else-if="formattedStats"
        class="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div
          v-for="(stat, key) in formattedStats"
          :key="key"
          class="bg-white rounded-lg shadow p-6"
        >
          <div class="flex items-center justify-between mb-4">
            <span class="text-gray-600 text-sm">{{ stat.label }}</span>
            <Icon :name="stat.icon" class="text-2xl text-blue-600" />
          </div>
          <p
            class="text-3xl font-bold"
            :class="stat.positive === false ? 'text-red-600' : 'text-gray-900'"
          >
            {{ stat.value }}
          </p>
        </div>
      </div>
    </section>

    <!-- Activities Feed -->
    <section class="bg-white rounded-lg shadow">
      <div class="p-6 border-b">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">Recent Activities</h2>
          <button
            @click="refreshActivities"
            :disabled="activitiesPending"
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {{ activitiesPending ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div class="p-6">
        <div v-if="activitiesPending" class="space-y-4">
          <!-- Loading skeletons -->
          <div
            v-for="i in 5"
            :key="i"
            class="flex items-start gap-4 animate-pulse"
          >
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>

        <div
          v-else-if="allActivities.length === 0"
          class="text-center py-12 text-gray-500"
        >
          <p>No recent activities</p>
        </div>

        <div v-else class="space-y-4">
          <TransitionGroup name="activity">
            <div
              v-for="activity in allActivities"
              :key="activity.id"
              class="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition"
            >
              <div
                class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
              >
                <Icon
                  :name="getActivityIcon(activity.type)"
                  class="text-blue-600 text-xl"
                />
              </div>

              <div class="flex-1">
                <p class="text-gray-900">{{ activity.description }}</p>
                <p class="text-sm text-gray-500">
                  {{ formatTimestamp(activity.timestamp) }}
                </p>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Activity transition animations */
.activity-enter-active,
.activity-leave-active {
  transition: all 0.3s ease;
}

.activity-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.activity-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>

<!--
Supporting Files:

1. composables/useAuth.ts
export const useAuth = () => {
  const user = useState<User | null>('user', () => null)

  const login = async (email: string, password: string) => {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = response.user
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return {
    user: readonly(user),
    login,
    logout
  }
}

2. middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

  if (!user.value) {
    return navigateTo('/login')
  }
})

3. server/api/dashboard/stats.get.ts
export default defineEventHandler(async (event) => {
  const stats = await db.dashboard.getStats()

  return {
    totalUsers: stats.users,
    totalPosts: stats.posts,
    totalRevenue: stats.revenue,
    growthRate: stats.growth
  }
})

4. server/api/dashboard/activities.get.ts
export default defineEventHandler(async (event) => {
  const activities = await db.dashboard.getActivities({ limit: 20 })

  return activities
})
-->
