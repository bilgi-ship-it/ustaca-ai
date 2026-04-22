variable "project_id" {
  description = "Google Cloud project id for the target environment."
  type        = string
}

variable "services" {
  description = "List of Google APIs to enable."
  type        = list(string)
}

