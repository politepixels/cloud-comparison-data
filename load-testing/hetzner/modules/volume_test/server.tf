resource "hcloud_server" "main" {
  name               = module.label.id
  server_type        = var.server_type
  image              = var.image
  location           = var.datacenter
  placement_group_id = hcloud_placement_group.main.id

  ssh_keys = [
    hcloud_ssh_key.key.id,
  ]

  user_data = <<EOF
#cloud-config
repo_update: true
repo_upgrade: all

runcmd:
 - apt-get update -y
 - apt-get install fio stress-ng sysbench -y
 - mkdir -p /tests/
 - mkdir -p /data/
 - mount /dev/sdb /data/
EOF
}

resource "hcloud_volume_attachment" "main" {
  volume_id = hcloud_volume.main.id
  server_id = hcloud_server.main.id
  automount = true
}