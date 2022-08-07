module "label" {
  source      = "git::https://github.com/cloudposse/terraform-null-label.git?ref=tags/0.22.1"
  namespace   = var.namespace
  environment = substr(var.environment, 0, 4)
  name        = var.name

  tags = {
    "Environment" = var.environment,
    "Namespace"   = var.namespace,
    "Stage"       = var.stage
  }
}
