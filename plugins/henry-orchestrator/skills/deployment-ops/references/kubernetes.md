# Kubernetes Production Patterns

Comprehensive guide to production Kubernetes patterns, StatefulSets, operators, and Helm charts.

## Core Resources Deep Dive

### Deployments

**Production-Ready Deployment:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
  namespace: production
  labels:
    app: webapp
    version: v1.2.0
spec:
  replicas: 3
  revisionHistoryLimit: 10

  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0

  selector:
    matchLabels:
      app: webapp

  template:
    metadata:
      labels:
        app: webapp
        version: v1.2.0
      annotations:
        prometheus.io/scrape: 'true'
        prometheus.io/port: '9090'

    spec:
      serviceAccountName: webapp-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001

      containers:
        - name: webapp
          image: myregistry/webapp:v1.2.0
          imagePullPolicy: IfNotPresent

          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
            - name: metrics
              containerPort: 9090

          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: webapp-secrets
                  key: database-url

          envFrom:
            - configMapRef:
                name: webapp-config

          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi

          livenessProbe:
            httpGet:
              path: /healthz
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3

          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3

          startupProbe:
            httpGet:
              path: /startup
              port: http
            initialDelaySeconds: 0
            periodSeconds: 10
            failureThreshold: 30

          volumeMounts:
            - name: config
              mountPath: /etc/config
              readOnly: true
            - name: cache
              mountPath: /var/cache

      volumes:
        - name: config
          configMap:
            name: webapp-config
        - name: cache
          emptyDir:
            sizeLimit: 1Gi

      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - webapp
                topologyKey: kubernetes.io/hostname
```

### StatefulSets

**For Stateful Applications:**

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: database
spec:
  serviceName: database
  replicas: 3

  selector:
    matchLabels:
      app: database

  template:
    metadata:
      labels:
        app: database
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine

          ports:
            - containerPort: 5432
              name: postgres

          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: password
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata

          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data

          resources:
            requests:
              cpu: 500m
              memory: 1Gi
            limits:
              cpu: 2
              memory: 4Gi

  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ['ReadWriteOnce']
        storageClassName: fast-ssd
        resources:
          requests:
            storage: 20Gi
```

### Services

**ClusterIP (Internal):**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  type: ClusterIP
  selector:
    app: webapp
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: metrics
      port: 9090
      targetPort: 9090
```

**LoadBalancer (External):**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-external
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
spec:
  type: LoadBalancer
  selector:
    app: webapp
  ports:
    - port: 443
      targetPort: 8080
  sessionAffinity: ClientIP
```

**Headless Service (StatefulSet):**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: database
spec:
  clusterIP: None # Headless
  selector:
    app: database
  ports:
    - port: 5432
```

## Configuration Management

### ConfigMaps

**From Literals:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  log_level: 'info'
  feature_flag: 'true'
  config.json: |
    {
      "database": {
        "pool_size": 20
      }
    }
```

**Versioned ConfigMaps:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-v2
data:
  config.yaml: |
    server:
      port: 8080
      timeout: 30s
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  template:
    spec:
      containers:
        - name: app
          envFrom:
            - configMapRef:
                name: app-config-v2
```

**Trigger Rollout on Change:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  template:
    metadata:
      annotations:
        config/checksum: { { include (print $.Template.BasePath "/configmap.yaml") . | sha256sum } }
```

### Secrets

**Opaque Secrets:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  api-key: 'secret-value-here'
  database-url: 'postgresql://user:pass@host:5432/db'
```

**TLS Secrets:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
type: kubernetes.io/tls
data:
  tls.crt: base64-encoded-cert
  tls.key: base64-encoded-key
```

**Docker Registry Secrets:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: registry-credentials
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: base64-encoded-docker-config
```

Use in Pod:

```yaml
spec:
  imagePullSecrets:
    - name: registry-credentials
  containers:
    - name: app
      image: private-registry/app:v1
```

## Ingress and Networking

### Ingress with TLS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
    nginx.ingress.kubernetes.io/force-ssl-redirect: 'true'
spec:
  ingressClassName: nginx

  tls:
    - hosts:
        - app.example.com
      secretName: webapp-tls

  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: webapp-service
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 8080
```

### NetworkPolicy

**Restrict Pod Communication:**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: webapp-netpol
spec:
  podSelector:
    matchLabels:
      app: webapp

  policyTypes:
    - Ingress
    - Egress

  ingress:
    - from:
        - podSelector:
            matchLabels:
              role: frontend
      ports:
        - protocol: TCP
          port: 8080

  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - protocol: TCP
          port: 5432
    - to: # Allow DNS
        - namespaceSelector:
            matchLabels:
              name: kube-system
      ports:
        - protocol: UDP
          port: 53
```

## Autoscaling

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webapp

  minReplicas: 3
  maxReplicas: 10

  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 2
          periodSeconds: 15
      selectPolicy: Max

  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: '1000'
```

### Vertical Pod Autoscaler

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: webapp-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webapp

  updatePolicy:
    updateMode: 'Auto' # or "Recreate", "Initial", "Off"

  resourcePolicy:
    containerPolicies:
      - containerName: webapp
        minAllowed:
          cpu: 100m
          memory: 128Mi
        maxAllowed:
          cpu: 2
          memory: 2Gi
```

## Resource Management

### Resource Quotas

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: namespace-quota
  namespace: production
spec:
  hard:
    requests.cpu: '100'
    requests.memory: 200Gi
    limits.cpu: '200'
    limits.memory: 400Gi
    persistentvolumeclaims: '20'
    services.loadbalancers: '5'
```

### Limit Ranges

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: resource-limits
  namespace: production
spec:
  limits:
    - max:
        cpu: '4'
        memory: 8Gi
      min:
        cpu: 50m
        memory: 64Mi
      default:
        cpu: 500m
        memory: 512Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      type: Container
    - max:
        storage: 100Gi
      min:
        storage: 1Gi
      type: PersistentVolumeClaim
```

## Storage

### Persistent Volume Claim

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-storage
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 10Gi
```

Use in Pod:

```yaml
spec:
  containers:
    - name: app
      volumeMounts:
        - name: storage
          mountPath: /data
  volumes:
    - name: storage
      persistentVolumeClaim:
        claimName: app-storage
```

### Volume Types

**EmptyDir (Temporary):**

```yaml
volumes:
  - name: cache
    emptyDir:
      medium: Memory
      sizeLimit: 1Gi
```

**HostPath (Node Storage):**

```yaml
volumes:
  - name: logs
    hostPath:
      path: /var/log/app
      type: DirectoryOrCreate
```

**ConfigMap Volume:**

```yaml
volumes:
  - name: config
    configMap:
      name: app-config
      items:
        - key: config.json
          path: config.json
```

## RBAC

### ServiceAccount

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: webapp-sa
  namespace: production
```

### Role and RoleBinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: production
rules:
  - apiGroups: ['']
    resources: ['pods']
    verbs: ['get', 'list', 'watch']
  - apiGroups: ['']
    resources: ['configmaps']
    verbs: ['get']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
  - kind: ServiceAccount
    name: webapp-sa
    namespace: production
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### ClusterRole (Cluster-Wide)

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: secret-reader
rules:
  - apiGroups: ['']
    resources: ['secrets']
    verbs: ['get', 'list']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: read-secrets-global
subjects:
  - kind: ServiceAccount
    name: webapp-sa
    namespace: production
roleRef:
  kind: ClusterRole
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```

## Jobs and CronJobs

### Job

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-migration
spec:
  backoffLimit: 3
  activeDeadlineSeconds: 600

  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migration
          image: myapp/migration:v1
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: url
```

### CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup-job
spec:
  schedule: '0 2 * * *' # Daily at 2 AM
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1

  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: cleanup
              image: myapp/cleanup:v1
              args:
                - --older-than=30d
```

## Helm Charts

### Chart Structure

```
mychart/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── _helpers.tpl
│   └── NOTES.txt
└── charts/
```

### Chart.yaml

```yaml
apiVersion: v2
name: webapp
description: Web application Helm chart
type: application
version: 1.2.0
appVersion: '1.2.0'

dependencies:
  - name: postgresql
    version: '12.x.x'
    repository: 'https://charts.bitnami.com/bitnami'
    condition: postgresql.enabled
```

### values.yaml

```yaml
replicaCount: 3

image:
  repository: myregistry/webapp
  tag: '1.2.0'
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: app.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: webapp-tls
      hosts:
        - app.example.com

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

postgresql:
  enabled: true
  auth:
    database: webapp
    username: webapp
```

### Template with Values

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: { { include "webapp.fullname" . } }
  labels: { { - include "webapp.labels" . | nindent 4 } }
spec:
  replicas: { { .Values.replicaCount } }
  selector:
    matchLabels: { { - include "webapp.selectorLabels" . | nindent 6 } }
  template:
    metadata:
      labels: { { - include "webapp.selectorLabels" . | nindent 8 } }
    spec:
      containers:
        - name: { { .Chart.Name } }
          image: '{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}'
          imagePullPolicy: { { .Values.image.pullPolicy } }
          ports:
            - name: http
              containerPort: { { .Values.service.targetPort } }
          resources: { { - toYaml .Values.resources | nindent 10 } }
```

### Helpers (\_helpers.tpl)

```yaml
{{- define "webapp.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "webapp.labels" -}}
app.kubernetes.io/name: {{ include "webapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
```

### Helm Commands

```bash
# Install chart
helm install myapp ./mychart

# Install with values
helm install myapp ./mychart -f production-values.yaml

# Upgrade
helm upgrade myapp ./mychart

# Rollback
helm rollback myapp 1

# Template (dry-run)
helm template myapp ./mychart

# Package chart
helm package ./mychart

# Dependency update
helm dependency update ./mychart
```

## Best Practices

### Security

- Run containers as non-root
- Use read-only root filesystem where possible
- Drop unnecessary capabilities
- Use NetworkPolicies
- Enable Pod Security Standards
- Scan images for vulnerabilities
- Use secrets for sensitive data
- Implement RBAC properly
- Keep Kubernetes updated

### Resource Management

- Always set resource requests and limits
- Use HPA for variable load
- Implement proper health checks
- Use PodDisruptionBudgets for availability
- Set appropriate replica counts
- Use node affinity/anti-affinity

### Observability

- Label resources consistently
- Add annotations for tooling
- Expose metrics endpoints
- Implement structured logging
- Use distributed tracing
- Monitor resource usage

### Deployment Strategy

- Use rolling updates
- Set proper readiness probes
- Implement graceful shutdown
- Version ConfigMaps/Secrets
- Use Helm for complex applications
- Implement GitOps (ArgoCD/Flux)
- Test in staging first

### High Availability

- Run multiple replicas
- Spread pods across nodes (anti-affinity)
- Use multiple availability zones
- Implement proper health checks
- Set PodDisruptionBudgets
- Use StatefulSets for stateful apps
- Regular backups for persistent data
