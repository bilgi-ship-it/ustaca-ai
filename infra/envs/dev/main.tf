module "project_base" {
  source     = "../../modules/project_base"
  project_id = var.project_id
  services   = var.services
}

