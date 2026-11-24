package com.acme

import dev.openfeature.sdk.Client

class Beta(client: Client):
  def enabled(user: String): Boolean =
    val flag = client.getBooleanValue("scala3-flag", false)
    val env = sys.env.get("FEATURE_SCALA3_BETA").contains("true")
    flag && env
