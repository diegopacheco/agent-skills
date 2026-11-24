package main

import (
	"context"
	"fmt"
	"os"

	"github.com/launchdarkly/go-sdk-common/v3/ldcontext"
	ld "github.com/launchdarkly/go-server-sdk/v7"
	"github.com/open-feature/go-sdk/openfeature"
	flipt "go.flipt.io/flipt/rpc/flipt/evaluation"
)

const FlagCheckout = "go-checkout"

func run(client *ld.LDClient, of *openfeature.Client, region string) {
	ctx := ldcontext.New("user")
	a, _ := client.BoolVariation("go-flag", ctx, false)
	b, _ := client.BoolVariation(FlagCheckout, ctx, false)
	c, _ := of.BooleanValue(context.Background(), "go-of-flag", false, openfeature.EvaluationContext{})
	d, _ := client.BoolVariation(fmt.Sprintf("go-region-%s", region), ctx, false)
	req := &flipt.EvaluationRequest{FlagKey: "go-flipt"}
	turbo := os.Getenv("FEATURE_GO_TURBO")
	fmt.Println(a, b, c, d, req, turbo)
}
