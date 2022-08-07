module "cluster" {
  source = "./modules/cluster"

  namespace   = var.namespace
  environment = var.environment
  stage       = var.stage
}

resource "time_sleep" "snooze_before_test" {
  create_duration = "60s"

  depends_on = [module.cluster]
}

module "test" {
  source = "../../modules/test"

  ssh_key        = module.cluster.ssh_key
  ip_addr        = module.cluster.ip_addr
  cloud_provider = "hetzner"

  depends_on = [time_sleep.snooze_before_test]
}