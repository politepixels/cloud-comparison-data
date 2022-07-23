resource "local_file" "pem" {
  filename = "${path.module}/output/ssh.pem"
  file_permission = "600"
  directory_permission = "700"
  content = tls_private_key.key.private_key_pem
}

resource "local_file" "connect" {
  filename = "${path.module}/output/connect.sh"
  file_permission = "770"
  directory_permission = "770"
  content = "ssh root@${hcloud_server.main.ipv4_address} -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -i \"${abspath(path.module)}/output/ssh.pem\""
}