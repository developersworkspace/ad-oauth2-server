# -- BUILD AND INSTALL ad-oauth2-server--

# Update machine package indexes
sudo apt-get update

# Download and run script to install node 7
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -

# Install node 7
apt-get install -y nodejs

# Install 'typescript' node package
npm install -g typescript

# Install 'gulp' node package
npm install -g gulp

# Clone 'ad-oauth2-sevrver' repository
git clone https://github.com/developersworkspace/ad-oauth2-server.git

# Change directory to 'api'
cd ./ad-oauth2-server/api

# Install node packages for 'api'
npm install

# Build 'api'
npm run build

# Change to root of repository
cd ./../

# Build docker images
docker-compose build --no-cache

# Run docker compose as deamon
docker-compose up -d

# Open 4000 port
sudo ufw allow 4000/tcp