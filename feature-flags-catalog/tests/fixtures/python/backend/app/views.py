import ldclient
import posthog
from flagsmith import Flagsmith
from statsig import statsig
from waffle import flag_is_active

flagsmith = Flagsmith(environment_key="x")


def home(request, context, user):
    a = ldclient.get().variation("py-flag", context, False)
    b = posthog.feature_enabled("py-posthog", "user-1")
    c = flag_is_active(request, "py-waffle")
    flags = flagsmith.get_environment_flags()
    d = flags.is_feature_enabled("py-flagsmith")
    e = statsig.check_gate(user, "py-gate")
    return a and b and c and d and e
