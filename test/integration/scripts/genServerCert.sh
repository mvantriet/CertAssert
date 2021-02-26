CWD=$(dirname "$0")
GEN_DIR="$CWD/../gen/cert/server"
if [ -d $GEN_DIR ]; then
    echo "Server cert already generated before..skipping"
    exit 0
fi
echo "Making gen directory if it does not exist:"
mkdir -p $GEN_DIR
GEN_DIR_ABS="$(cd "$(dirname "$GEN_DIR")"; pwd)/$(basename "$GEN_DIR")"
echo "Output dir: $GEN_DIR_ABS"

echo "Generating self signed server certificate for testing locally"
openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=NL/ST=OVR/O=CERTASSERT/CN=certassert" \
    -keyout $GEN_DIR/certassertServerCert.key  -out $GEN_DIR/certassertServerCert.pem
