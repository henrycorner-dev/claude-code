# Monitoring and Observability

Complete guide to Prometheus metrics, Grafana dashboards, alerting rules, and PromQL queries.

## Prometheus Setup

### Prometheus Configuration

**prometheus.yml:**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    region: 'us-east-1'

alerting:
  alertmanagers:
  - static_configs:
    - targets:
      - alertmanager:9093

rule_files:
  - /etc/prometheus/rules/*.yml

scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
    - targets: ['localhost:9090']

  # Node exporter
  - job_name: 'node'
    static_configs:
    - targets:
      - 'node1:9100'
      - 'node2:9100'

  # Kubernetes pods
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
    - role: pod

    relabel_configs:
    # Only scrape pods with prometheus.io/scrape annotation
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true

    # Use custom port if specified
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
      action: replace
      regex: (.+)
      target_label: __address__
      replacement: $1

    # Use custom path if specified
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
      action: replace
      target_label: __metrics_path__
      regex: (.+)

    # Add pod labels
    - action: labelmap
      regex: __meta_kubernetes_pod_label_(.+)

    - source_labels: [__meta_kubernetes_namespace]
      target_label: kubernetes_namespace

    - source_labels: [__meta_kubernetes_pod_name]
      target_label: kubernetes_pod_name

  # Service monitors
  - job_name: 'kubernetes-services'
    kubernetes_sd_configs:
    - role: service

    relabel_configs:
    - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
      action: keep
      regex: true
    - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_port]
      action: replace
      target_label: __address__
      regex: ([^:]+)(?::\d+)?;(\d+)
      replacement: $1:$2
    - action: labelmap
      regex: __meta_kubernetes_service_label_(.+)
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
      - name: prometheus
        image: prom/prometheus:v2.45.0
        args:
        - --config.file=/etc/prometheus/prometheus.yml
        - --storage.tsdb.path=/prometheus
        - --storage.tsdb.retention.time=15d
        - --web.enable-lifecycle
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
        resources:
          requests:
            cpu: 500m
            memory: 2Gi
          limits:
            cpu: 2
            memory: 4Gi
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        persistentVolumeClaim:
          claimName: prometheus-storage
```

## Application Instrumentation

### Node.js (Express)

```javascript
const express = require('express');
const promClient = require('prom-client');

const app = express();

// Create registry
const register = new promClient.Registry();

// Default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);

// Middleware
app.use((req, res, next) => {
  const start = Date.now();

  activeConnections.inc();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
    activeConnections.dec();
  });

  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.listen(3000);
```

### Python (FastAPI)

```python
from fastapi import FastAPI, Request
from prometheus_client import Counter, Histogram, Gauge, make_asgi_app
import time

app = FastAPI()

# Metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1, 5]
)

active_connections = Gauge(
    'active_connections',
    'Number of active connections'
)

# Middleware
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    active_connections.inc()
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time

    labels = {
        'method': request.method,
        'endpoint': request.url.path,
        'status': response.status_code
    }

    http_requests_total.labels(**labels).inc()
    http_request_duration_seconds.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)

    active_connections.dec()

    return response

# Mount metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)
```

### Go

```go
package main

import (
    "net/http"
    "time"

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )

    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request duration in seconds",
            Buckets: []float64{0.01, 0.05, 0.1, 0.5, 1, 5},
        },
        []string{"method", "endpoint"},
    )

    activeConnections = prometheus.NewGauge(
        prometheus.GaugeOpts{
            Name: "active_connections",
            Help: "Number of active connections",
        },
    )
)

func init() {
    prometheus.MustRegister(httpRequestsTotal)
    prometheus.MustRegister(httpRequestDuration)
    prometheus.MustRegister(activeConnections)
}

func metricsMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        activeConnections.Inc()
        defer activeConnections.Dec()

        start := time.Now()

        // Wrap response writer to capture status code
        wrappedWriter := &responseWriter{ResponseWriter: w, statusCode: 200}

        next(wrappedWriter, r)

        duration := time.Since(start).Seconds()

        httpRequestsTotal.WithLabelValues(
            r.Method,
            r.URL.Path,
            http.StatusText(wrappedWriter.statusCode),
        ).Inc()

        httpRequestDuration.WithLabelValues(
            r.Method,
            r.URL.Path,
        ).Observe(duration)
    }
}

type responseWriter struct {
    http.ResponseWriter
    statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
    rw.statusCode = code
    rw.ResponseWriter.WriteHeader(code)
}

func main() {
    http.Handle("/metrics", promhttp.Handler())
    http.HandleFunc("/api/hello", metricsMiddleware(helloHandler))
    http.ListenAndServe(":8080", nil)
}
```

## PromQL Queries

### Basic Queries

**Current value:**
```promql
# Current CPU usage
node_cpu_seconds_total

# HTTP requests in last 5 minutes
http_requests_total[5m]
```

**Rate calculations:**
```promql
# Requests per second
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])
```

**Aggregation:**
```promql
# Sum across all instances
sum(rate(http_requests_total[5m]))

# Average by endpoint
avg by (endpoint) (rate(http_request_duration_seconds_sum[5m]))

# Count instances
count(up == 1)
```

### Advanced Queries

**Percentiles:**
```promql
# 95th percentile latency
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket[5m])
)

# 99th percentile by endpoint
histogram_quantile(0.99,
  sum by (endpoint, le) (
    rate(http_request_duration_seconds_bucket[5m])
  )
)
```

**Alerting queries:**
```promql
# High error rate
rate(http_requests_total{status=~"5.."}[5m]) /
rate(http_requests_total[5m]) > 0.05

# High latency
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket[5m])
) > 1

# Low availability
avg_over_time(up[5m]) < 0.99
```

**Resource monitoring:**
```promql
# Memory usage percentage
100 * (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)

# Disk usage
100 * (node_filesystem_size_bytes - node_filesystem_avail_bytes) /
node_filesystem_size_bytes

# CPU usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

**Application metrics:**
```promql
# Request rate by status
sum by (status) (rate(http_requests_total[5m]))

# Average response time
rate(http_request_duration_seconds_sum[5m]) /
rate(http_request_duration_seconds_count[5m])

# Traffic spike detection
rate(http_requests_total[5m]) >
avg_over_time(rate(http_requests_total[5m])[1h:5m]) * 2
```

## Alerting Rules

### Recording Rules

```yaml
groups:
- name: recording_rules
  interval: 30s
  rules:
  # Request rate
  - record: job:http_requests:rate5m
    expr: sum by (job) (rate(http_requests_total[5m]))

  # Error rate
  - record: job:http_errors:rate5m
    expr: sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))

  # Latency percentiles
  - record: job:http_request_duration:p95
    expr: |
      histogram_quantile(0.95,
        sum by (job, le) (rate(http_request_duration_seconds_bucket[5m]))
      )

  - record: job:http_request_duration:p99
    expr: |
      histogram_quantile(0.99,
        sum by (job, le) (rate(http_request_duration_seconds_bucket[5m]))
      )
```

### Alerting Rules

```yaml
groups:
- name: application_alerts
  interval: 30s
  rules:
  # High error rate
  - alert: HighErrorRate
    expr: |
      (
        sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))
        /
        sum by (job) (rate(http_requests_total[5m]))
      ) > 0.05
    for: 5m
    labels:
      severity: critical
      team: backend
    annotations:
      summary: "High error rate detected"
      description: "{{ $labels.job }} has error rate of {{ $value | humanizePercentage }}"

  # High latency
  - alert: HighLatency
    expr: |
      histogram_quantile(0.95,
        sum by (job, le) (rate(http_request_duration_seconds_bucket[5m]))
      ) > 1
    for: 5m
    labels:
      severity: warning
      team: backend
    annotations:
      summary: "High latency detected"
      description: "{{ $labels.job }} p95 latency is {{ $value }}s"

  # Service down
  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
      team: sre
    annotations:
      summary: "Service is down"
      description: "{{ $labels.job }} on {{ $labels.instance }} is down"

  # Low disk space
  - alert: LowDiskSpace
    expr: |
      (
        node_filesystem_avail_bytes{mountpoint="/"}
        /
        node_filesystem_size_bytes{mountpoint="/"}
      ) < 0.1
    for: 5m
    labels:
      severity: warning
      team: sre
    annotations:
      summary: "Low disk space"
      description: "{{ $labels.instance }} has less than 10% disk space available"

  # High memory usage
  - alert: HighMemoryUsage
    expr: |
      (
        1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)
      ) > 0.9
    for: 5m
    labels:
      severity: warning
      team: sre
    annotations:
      summary: "High memory usage"
      description: "{{ $labels.instance }} memory usage is {{ $value | humanizePercentage }}"

  # Pod crash looping
  - alert: PodCrashLooping
    expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
    for: 5m
    labels:
      severity: critical
      team: sre
    annotations:
      summary: "Pod is crash looping"
      description: "Pod {{ $labels.namespace }}/{{ $labels.pod }} is crash looping"
```

## Alertmanager Configuration

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/XXX'

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

  routes:
  # Critical alerts to PagerDuty
  - match:
      severity: critical
    receiver: 'pagerduty'
    continue: true

  # Backend team alerts
  - match:
      team: backend
    receiver: 'backend-team'
    group_by: ['alertname', 'job']

  # SRE team alerts
  - match:
      team: sre
    receiver: 'sre-team'

receivers:
- name: 'default'
  slack_configs:
  - channel: '#alerts'
    title: '{{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

- name: 'pagerduty'
  pagerduty_configs:
  - service_key: 'YOUR_PAGERDUTY_KEY'

- name: 'backend-team'
  slack_configs:
  - channel: '#backend-alerts'
    title: '{{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

- name: 'sre-team'
  slack_configs:
  - channel: '#sre-alerts'
    title: '{{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
  email_configs:
  - to: 'sre@company.com'
    from: 'alertmanager@company.com'
    smarthost: 'smtp.company.com:587'

inhibit_rules:
# Inhibit warning if critical is firing
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname', 'instance']
```

## Grafana Dashboards

### Dashboard JSON Structure

```json
{
  "dashboard": {
    "title": "Application Metrics",
    "tags": ["application", "production"],
    "timezone": "browser",
    "refresh": "30s",

    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (job)",
            "legendFormat": "{{ job }}"
          }
        ],
        "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8}
      },
      {
        "id": 2,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (job) / sum(rate(http_requests_total[5m])) by (job)",
            "legendFormat": "{{ job }}"
          }
        ],
        "gridPos": {"x": 12, "y": 0, "w": 12, "h": 8}
      }
    ]
  }
}
```

### Panel Types

**Time Series:**
- Line graphs for trends
- Area charts for cumulative metrics
- Stacked for breakdowns

**Gauge:**
- Current value with thresholds
- Good for percentages, ratios

**Stat:**
- Single value display
- Show latest value or aggregate

**Table:**
- Multiple metrics side-by-side
- Good for instance comparisons

**Heatmap:**
- Distribution over time
- Good for latency histograms

## Service Level Objectives (SLOs)

### Availability SLO

```yaml
# 99.9% availability target
- alert: AvailabilitySLOBreach
  expr: |
    (
      1 - (
        sum(rate(http_requests_total{status=~"5.."}[30d]))
        /
        sum(rate(http_requests_total[30d]))
      )
    ) < 0.999
  labels:
    severity: critical
  annotations:
    summary: "Availability SLO breached"
    description: "30-day availability is {{ $value | humanizePercentage }}"
```

### Latency SLO

```yaml
# 95% of requests under 200ms
- alert: LatencySLOBreach
  expr: |
    histogram_quantile(0.95,
      sum by (le) (rate(http_request_duration_seconds_bucket[30d]))
    ) > 0.2
  labels:
    severity: critical
  annotations:
    summary: "Latency SLO breached"
    description: "p95 latency is {{ $value }}s over 30 days"
```

## Best Practices

### Metric Naming

**Follow conventions:**
- Use underscores: `http_requests_total`
- Include unit suffix: `_seconds`, `_bytes`, `_total`
- Be descriptive: `http_request_duration_seconds` not `http_dur`

**Metric types:**
- Counters: `_total` suffix (monotonically increasing)
- Gauges: current value that can go up/down
- Histograms: `_bucket`, `_sum`, `_count` suffixes
- Summaries: quantiles pre-calculated

### Label Best Practices

**Good labels:**
- Low cardinality: `status`, `method`, `endpoint`
- Meaningful: `environment`, `region`, `version`

**Bad labels:**
- High cardinality: user_id, request_id, timestamp
- Redundant: information in metric name

### Query Optimization

- Use recording rules for expensive queries
- Limit time range for heavy queries
- Use appropriate rate interval (4x scrape interval)
- Aggregate early with `sum by` or `avg by`

### Dashboard Design

- Group related metrics together
- Use consistent time ranges
- Add descriptions to panels
- Use variables for filtering
- Set appropriate refresh intervals
- Include SLO/SLA indicators

### Alert Tuning

- Use `for` clause to avoid flapping
- Set appropriate severity levels
- Include actionable descriptions
- Group related alerts
- Use inhibition rules
- Monitor alert volume
