resource "google_cloud_run_v2_service" "service" {
  name     = var.name
  location = var.region
  project  = var.project_id

  template {
    service_account = var.service_account

    containers {
      image = var.image
    }
  }
}

