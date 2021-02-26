CWD=$(dirname "$0")
GEN_DIR="$CWD/../gen/cert/signing"
if [ -d $GEN_DIR ]; then
    echo "Signing key(s) already generated before..skipping"
    exit 0
fi
mkdir -p $GEN_DIR
openssl genrsa -out $GEN_DIR/certassertSigningKey.key 4096