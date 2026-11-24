package com.acme;

import org.togglz.core.Feature;
import org.togglz.core.annotation.Label;
import org.togglz.core.context.FeatureContext;

public enum MyFeatures implements Feature {

    @Label("New search")
    NEW_SEARCH,

    @Label("Old search")
    OLD_SEARCH;

    public boolean isActive() {
        return FeatureContext.getFeatureManager().isActive(this);
    }
}
