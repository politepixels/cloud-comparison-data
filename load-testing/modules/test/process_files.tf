resource "null_resource" "process_files" {
  provisioner "local-exec" {
    command = "${abspath(path.module)}/scripts/normalise_fio.sh ${abspath(path.module)}/output/${var.cloud_provider}/tests/volume-sequential.test.stdout ${abspath(path.module)}/../../results/${var.cloud_provider}/volume-sequential.test.yaml"
  }

  provisioner "local-exec" {
    command = "${abspath(path.module)}/scripts/normalise_fio.sh ${abspath(path.module)}/output/${var.cloud_provider}/tests/volume-random.test.stdout ${abspath(path.module)}/../../results/${var.cloud_provider}/volume-random.test.yaml"
  }

  provisioner "local-exec" {
    command = "${abspath(path.module)}/scripts/normalise_fio.sh ${abspath(path.module)}/output/${var.cloud_provider}/tests/random.test.stdout ${abspath(path.module)}/../../results/${var.cloud_provider}/random.test.yaml"
  }

  provisioner "local-exec" {
    command = "${abspath(path.module)}/scripts/normalise_fio.sh ${abspath(path.module)}/output/${var.cloud_provider}/tests/sequential.test.stdout ${abspath(path.module)}/../../results/${var.cloud_provider}/sequential.test.yaml"
  }

  provisioner "local-exec" {
    command = "${abspath(path.module)}/scripts/normalise_cpu.sh ${abspath(path.module)}/output/${var.cloud_provider}/tests/cpu.test.stdout ${abspath(path.module)}/../../results/${var.cloud_provider}/cpu.test.yaml"
  }

  provisioner "local-exec" {
    command = "${abspath(path.module)}/scripts/normalise_memory.sh ${abspath(path.module)}/output/${var.cloud_provider}/tests/memory.test.stdout ${abspath(path.module)}/../../results/${var.cloud_provider}/memory.test.yaml"
  }

  depends_on = [null_resource.copy_files]
}