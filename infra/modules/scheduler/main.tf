resource "google_cloud_scheduler_job" "job" {
  name      = var.name
  project   = var.project_id
  region    = var.region
  schedule  = var.schedule
  time_zone = var.time_zone

  http_target {
    uri         = var.uri
    http_method = "POST"
  }
}

