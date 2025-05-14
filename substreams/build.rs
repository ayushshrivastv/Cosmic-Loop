use std::path::Path;

fn main() {
    let proto_dir = Path::new("proto");
    
    // Tell Cargo to rerun this build script if any of the proto files change
    println!("cargo:rerun-if-changed=proto/nft.proto");
    println!("cargo:rerun-if-changed=proto/bridge.proto");
    println!("cargo:rerun-if-changed=proto/marketplace.proto");

    // Generate Rust code from the proto files
    prost_build::compile_protos(
        &[
            proto_dir.join("nft.proto"),
            proto_dir.join("bridge.proto"),
            proto_dir.join("marketplace.proto"),
        ],
        &[proto_dir],
    )
    .unwrap();
}
