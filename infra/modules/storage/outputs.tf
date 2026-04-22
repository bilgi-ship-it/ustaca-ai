output "bucket_name" {
  description = "Provisioned storage bucket."
  value       = google_storage_bucket.bucket.name
}

