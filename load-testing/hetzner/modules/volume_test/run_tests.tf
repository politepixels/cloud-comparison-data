resource "time_sleep" "snooze_before_test" {
  depends_on = [
    hcloud_server.main,
    hcloud_volume.main,
    hcloud_volume_attachment.main
  ]

  create_duration = "60s"
}

resource "null_resource" "test" {
  depends_on = [time_sleep.snooze_before_test]

  connection {
    type        = "ssh"
    host        = hcloud_server.main.ipv4_address
    private_key = tls_private_key.key.private_key_pem
  }

  provisioner "remote-exec" {
    inline = [
      // Volume Tests
      "echo 'Running Sequential Test...'",
      "/usr/bin/fio --name 'DB_TEST' --eta-newline='5s' --filename='sequential.test' --rw='write' --size='22m' --blocksize='2300' --ioengine='sync' --fsync='1' > /tests/sequential.test.stdout",
      "sleep 30; echo 'Running Random Test...'",
      "/usr/bin/fio --name 'RANDOM_TEST' --eta-newline='5s' --filename='random.test' --rw='randrw' --size='2g' --io_size='10g' --blocksize='4k' --ioengine='libaio' --fsync='1' --iodepth='1' --direct='1' --numjobs='1' --runtime='60' --group_reporting > /tests/random.test.stdout",
      "cd /data",
      "sleep 30; echo 'Running Sequential Volume Test...'",
      "/usr/bin/fio --name 'DB_TEST' --eta-newline='5s' --filename='sequential.test' --rw='write' --size='22m' --blocksize='2300' --ioengine='sync' --fsync='1' > /tests/volume-sequential.test.stdout",
      "sleep 30; echo 'Running Random Volume Test...'",
      "/usr/bin/fio --name 'RANDOM_TEST' --eta-newline='5s' --filename='random.test' --rw='randrw' --size='2g' --io_size='10g' --blocksize='4k' --ioengine='libaio' --fsync='1' --iodepth='1' --direct='1' --numjobs='1' --runtime='60' --group_reporting > /tests/volume-random.test.stdout",
      // Cpu Tests
      "sleep 30; echo 'Running CPU Test...'",
#      "/usr/bin/stress-ng --cpu 4 --cpu-method matrixprod --perf -t 30 --yaml /tests/cpu.test.stdout",
      "/usr/bin/sysbench --test=cpu --cpu-max-prime=20000 run > /tests/cpu.test.stdout",
      // Memory Tests
      "sleep 30; echo 'Running Memory Test...'",
      "/usr/bin/sysbench --test=memory --memory-block-size=1M --memory-total-size=10G run > /tests/memory.test.stdout"
    ]
  }
}