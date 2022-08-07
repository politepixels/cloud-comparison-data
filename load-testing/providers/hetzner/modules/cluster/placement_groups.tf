resource "hcloud_placement_group" "main" {
  name   = module.label.id
  type   = "spread"
  labels = {
    kubernetes_role = "master"
  }
}