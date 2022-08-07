resource "local_file" "pem" {
  filename = "${path.module}/output/${var.cloud_provider}/ssh.pem"
  file_permission = "600"
  directory_permission = "700"
  content = var.ssh_key
}

resource "local_file" "connect" {
  filename = "${path.module}/output/${var.cloud_provider}/connect.sh"
  file_permission = "770"
  directory_permission = "770"
  content = "ssh root@${var.ip_addr} -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -i \"${abspath(path.module)}/output/${var.cloud_provider}/ssh.pem\""
}