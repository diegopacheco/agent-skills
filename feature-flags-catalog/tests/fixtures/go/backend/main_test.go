package main

import (
	"os"
	"testing"
)

func TestTurbo(t *testing.T) {
	if os.Getenv("FEATURE_GO_TESTONLY") == "" {
		t.Skip()
	}
}
