resource "google_cloud_tasks_queue" "queue" {
  name     = var.name
  project  = var.project_id
  location = var.location
}

