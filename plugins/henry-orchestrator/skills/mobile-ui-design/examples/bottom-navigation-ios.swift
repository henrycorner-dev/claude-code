// iOS Bottom Navigation (Tab Bar) Implementation
// Complete working example with SwiftUI

import SwiftUI

// MARK: - Main App with Tab Bar
struct ContentView: View {
    @State private var selectedTab = 0
    @State private var notificationCount = 3

    var body: some View {
        TabView(selection: $selectedTab) {
            // Home Tab
            NavigationView {
                HomeView()
            }
            .tabItem {
                Label("Home", systemImage: selectedTab == 0 ? "house.fill" : "house")
            }
            .tag(0)

            // Search Tab
            NavigationView {
                SearchView()
            }
            .tabItem {
                Label("Search", systemImage: selectedTab == 1 ? "magnifyingglass" : "magnifyingglass")
            }
            .tag(1)

            // Notifications Tab with Badge
            NavigationView {
                NotificationsView(count: $notificationCount)
            }
            .tabItem {
                Label("Notifications", systemImage: selectedTab == 2 ? "bell.fill" : "bell")
            }
            .badge(notificationCount > 0 ? notificationCount : nil)
            .tag(2)

            // Profile Tab
            NavigationView {
                ProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: selectedTab == 3 ? "person.fill" : "person")
            }
            .tag(3)
        }
        .accentColor(.blue)
    }
}

// MARK: - Home View with Navigation
struct HomeView: View {
    @State private var items = [
        Item(id: "1", title: "First Item", subtitle: "Details about first item"),
        Item(id: "2", title: "Second Item", subtitle: "Details about second item"),
        Item(id: "3", title: "Third Item", subtitle: "Details about third item")
    ]

    var body: some View {
        List {
            ForEach(items) { item in
                NavigationLink(destination: ItemDetailView(item: item)) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(item.title)
                            .font(.headline)
                        Text(item.subtitle)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .navigationTitle("Home")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    // Add action
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
    }
}

// MARK: - Item Detail View
struct ItemDetailView: View {
    let item: Item

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(item.title)
                    .font(.title)
                    .fontWeight(.bold)

                Text(item.subtitle)
                    .font(.body)
                    .foregroundColor(.secondary)

                Divider()

                Text("Additional details about this item would go here. This demonstrates how stack navigation works within a tab.")
                    .font(.body)

                Button {
                    // Action
                } label: {
                    Text("Take Action")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(10)
                }
                .padding(.top)
            }
            .padding()
        }
        .navigationTitle(item.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Search View
struct SearchView: View {
    @State private var searchText = ""
    @State private var searchResults: [Item] = []

    var body: some View {
        List {
            ForEach(searchResults) { item in
                NavigationLink(destination: ItemDetailView(item: item)) {
                    HStack {
                        Image(systemName: "doc.text")
                            .foregroundColor(.blue)
                        VStack(alignment: .leading) {
                            Text(item.title)
                                .font(.headline)
                            Text(item.subtitle)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
        }
        .navigationTitle("Search")
        .searchable(text: $searchText, prompt: "Search items...")
        .onChange(of: searchText) { newValue in
            performSearch(query: newValue)
        }
    }

    private func performSearch(query: String) {
        // Simulate search
        if query.isEmpty {
            searchResults = []
        } else {
            searchResults = [
                Item(id: "s1", title: "Search Result 1", subtitle: "Matching: \(query)"),
                Item(id: "s2", title: "Search Result 2", subtitle: "Matching: \(query)")
            ]
        }
    }
}

// MARK: - Notifications View
struct NotificationsView: View {
    @Binding var count: Int
    @State private var notifications = [
        NotificationItem(id: "1", title: "New message", time: "5m ago", isRead: false),
        NotificationItem(id: "2", title: "Update available", time: "1h ago", isRead: false),
        NotificationItem(id: "3", title: "Friend request", time: "2h ago", isRead: true)
    ]

    var body: some View {
        List {
            ForEach(notifications) { notification in
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(notification.title)
                            .font(.headline)
                            .foregroundColor(notification.isRead ? .secondary : .primary)
                        Text(notification.time)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    if !notification.isRead {
                        Circle()
                            .fill(Color.blue)
                            .frame(width: 8, height: 8)
                    }
                }
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) {
                        deleteNotification(notification)
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
                .swipeActions(edge: .leading) {
                    Button {
                        markAsRead(notification)
                    } label: {
                        Label("Mark Read", systemImage: "envelope.open")
                    }
                    .tint(.blue)
                }
            }
        }
        .navigationTitle("Notifications")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Clear All") {
                    notifications.removeAll()
                    count = 0
                }
            }
        }
    }

    private func markAsRead(_ notification: NotificationItem) {
        if let index = notifications.firstIndex(where: { $0.id == notification.id }) {
            notifications[index].isRead = true
            updateBadgeCount()
        }
    }

    private func deleteNotification(_ notification: NotificationItem) {
        notifications.removeAll { $0.id == notification.id }
        updateBadgeCount()
    }

    private func updateBadgeCount() {
        count = notifications.filter { !$0.isRead }.count
    }
}

// MARK: - Profile View
struct ProfileView: View {
    @State private var showSettings = false

    var body: some View {
        List {
            Section {
                HStack {
                    Image(systemName: "person.circle.fill")
                        .resizable()
                        .frame(width: 60, height: 60)
                        .foregroundColor(.blue)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("John Doe")
                            .font(.title2)
                            .fontWeight(.semibold)
                        Text("john.doe@example.com")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.leading, 8)
                }
                .padding(.vertical, 8)
            }

            Section("Account") {
                NavigationLink(destination: Text("Edit Profile")) {
                    Label("Edit Profile", systemImage: "pencil")
                }
                NavigationLink(destination: Text("Privacy")) {
                    Label("Privacy", systemImage: "lock")
                }
                NavigationLink(destination: Text("Security")) {
                    Label("Security", systemImage: "shield")
                }
            }

            Section("Preferences") {
                NavigationLink(destination: Text("Settings")) {
                    Label("Settings", systemImage: "gear")
                }
                NavigationLink(destination: Text("Help")) {
                    Label("Help & Support", systemImage: "questionmark.circle")
                }
            }

            Section {
                Button(role: .destructive) {
                    // Logout
                } label: {
                    Label("Log Out", systemImage: "arrow.right.square")
                        .foregroundColor(.red)
                }
            }
        }
        .navigationTitle("Profile")
    }
}

// MARK: - Models
struct Item: Identifiable {
    let id: String
    let title: String
    let subtitle: String
}

struct NotificationItem: Identifiable {
    let id: String
    let title: String
    let time: String
    var isRead: Bool
}

// MARK: - Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
