use std::io::Result;

fn main() -> Result<()> {
    println!("cargo:rerun-if-changed=proto/nft.proto");
    println!("cargo:rerun-if-changed=proto/marketplace.proto");
    println!("cargo:rerun-if-changed=proto/bridge.proto");

    prost_build::Config::new()
        .btree_map(["."])
        .compile_protos(
            &[
                "proto/nft.proto",
                "proto/marketplace.proto",
                "proto/bridge.proto",
            ],
            &["proto"],
        )?;

    Ok(())
}
