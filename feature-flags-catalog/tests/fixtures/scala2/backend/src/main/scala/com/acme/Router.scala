package com.acme

import com.typesafe.config.Config
import io.split.client.SplitClient

class Router(config: Config, split: SplitClient) {
  def route(userId: String): String = {
    val fast = config.getBoolean("features.scala-fast-path")
    val treatment = split.getTreatment(userId, "scala-split-test")
    if (fast && treatment == "on") "fast" else "slow"
  }
}
