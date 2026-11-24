package com.acme

import io.getunleash.Unleash
import org.togglz.core.Feature

enum class Features : Feature {
    BETA_PAY,
    OLD_PAY
}

class Ui(private val unleash: Unleash) {
    fun render(region: String): String {
        val fresh = unleash.isEnabled("kotlin-new-ui")
        val regional = unleash.isEnabled("region-$region")
        val pay = Features.BETA_PAY.isActive
        return "$fresh $regional $pay"
    }
}
