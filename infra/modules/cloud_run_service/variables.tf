variable "project_id" {
  description = "Google Cloud project id."
  type        = string
}

variable "region" {
  description = "Cloud Run region."
  type        = string
}

variable "name" {
  description = "Cloud Run service name."
  type        = string
}

variable "image" {
  description = "Container image reference."
  type        = string
}

variable "service_account" {
  description = "Runtime service account email."
  type        = string
}

