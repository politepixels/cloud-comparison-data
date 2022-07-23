module "cluster" {
  source = "./modules/volume_test"

  namespace   = var.namespace
  environment = var.environment
  stage       = var.stage
}