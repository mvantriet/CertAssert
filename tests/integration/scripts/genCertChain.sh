#!/bin/bash

# Get cwd and gen directory path
CWD=$(dirname "$0")
GEN_DIR="$CWD/../gen/cert/ca"

# Returns a openssl CA generation config
# $1 CA cert file path
# $2 CA key file path
function getCaConfig()
{
    local caConfig="
    [ ca ]
    default_ca              = CA_default
    [CA_default]
    dir                     = $GEN_DIR
    certs                   = $GEN_DIR
    new_certs_dir           = $GEN_DIR
    database                = $GEN_DIR/index.txt
    serial                  =$GEN_DIR/serial
    private_key             = $2
    certificate             = $1
    default_md              = sha256
    policy                  = default_ca_policy
    [default_ca_policy]
    countryName             = optional
    stateOrProvinceName     = optional
    organizationName        = match
    organizationalUnitName  = optional
    commonName              = supplied
    emailAddress            = supplied
    [req]
    distinguished_name      = req_distinguished_name
    x509_extensions         = v3_ca
    x509_extensions         = client_cert
    [v3_ca]
    keyUsage                = critical,keyCertSign,cRLSign
    basicConstraints        = critical,CA:TRUE
    subjectKeyIdentifier    = hash
    authorityKeyIdentifier  = keyid:always,issuer
    [v3_intermediate_ca]
    keyUsage                = critical,keyCertSign,cRLSign
    basicConstraints        = critical,CA:TRUE
    subjectKeyIdentifier    = hash
    authorityKeyIdentifier  = keyid:always,issuer
    [req_distinguished_name]
    CN                      = Unspecified string relating to issuer
    O                       = Organisation of the issuer
    [client_cert]
    basicConstraints        = CA:FALSE
    subjectKeyIdentifier    = hash
    authorityKeyIdentifier  = keyid:always,issuer
    "
    echo "$caConfig"
}

echo "Making gen directory if it does not exist:"
mkdir -p $GEN_DIR
GEN_DIR_ABS="$(cd "$(dirname "$GEN_DIR")"; pwd)/$(basename "$GEN_DIR")"
echo "Output dir: $GEN_DIR_ABS"

GEN_DIR_ESC=${GEN_DIR_ABS////\\/}

echo "Creating index file for cert serial numbers"
touch $GEN_DIR/index.txt

CERT_ASSERT_CA_TLS_CONFIG=$(getCaConfig $GEN_DIR/CertAssertLocalCA.pem $GEN_DIR/CertAssertLocalCA.key)
echo "Generating CertAssertLocalCA that can be used for testing locally"
openssl req -config <(echo "$CERT_ASSERT_CA_TLS_CONFIG") -extensions v3_ca -new -newkey rsa:2048 -days 100 -nodes -x509 \
    -subj "/O=CERTASSERT/CN=LOCALCA/emailAddress=cert@assert.com" \
    -keyout $GEN_DIR/CertAssertLocalCA.key  -out $GEN_DIR/CertAssertLocalCA.pem

echo "100001" > iconv -c -t "CP1252" > $GEN_DIR/serial
echo "Generating CertAssertLocalClientCert that can be used for testing locally"
openssl req -config <(echo "$CERT_ASSERT_CA_TLS_CONFIG") -extensions client_cert -newkey rsa:2048 -keyout $GEN_DIR/CertAssertLocalClientCert.key -out $GEN_DIR/CertAssertLocalClientCert_CSR.pem -nodes \
        -subj "/O=CERTASSERT/CN=LOCALCLIENT/emailAddress=clientcert@assert.com"
openssl ca -batch -notext -config <(echo "$CERT_ASSERT_CA_TLS_CONFIG") -policy default_ca_policy -extensions client_cert -days 50 -in $GEN_DIR/CertAssertLocalClientCert_CSR.pem -out $GEN_DIR/CertAssertLocalClientCert.pem 

echo "Done. Use curl for local testing:"
echo ":: curl --insecure --cert ./tests/integration/gen/cert/ca/CertAssertLocalClientCert.pem --key ./tests/integration/gen/cert/ca/CertAssertLocalClientCert.key https://localhost:8443/api/auth"