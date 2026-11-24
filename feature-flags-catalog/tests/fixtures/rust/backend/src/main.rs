use open_feature::OpenFeature;

#[cfg(feature = "metrics")]
fn metrics() {}

async fn run() {
    let api = OpenFeature::singleton().await;
    let client = api.create_client();
    let on = client.get_bool_value("rust-flag", None, None).await.unwrap_or(false);
    let fast = std::env::var("FEATURE_RUST_FAST").is_ok();
    let _ = (on, fast);
}

fn main() {}
