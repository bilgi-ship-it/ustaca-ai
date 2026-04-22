output "job_name" {
  description = "Provisioned scheduler job name."
  value       = google_cloud_scheduler_job.job.name
}

