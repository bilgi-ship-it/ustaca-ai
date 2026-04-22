output "queue_name" {
  description = "Provisioned tasks queue."
  value       = google_cloud_tasks_queue.queue.name
}

