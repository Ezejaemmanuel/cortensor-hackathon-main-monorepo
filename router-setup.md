# Installation & Setup

### DRAFT

**NOTE**: We are currently in the closed alpha phase for precursor miner testing. To set up and run the process below, you’ll need test ETH on Arbitrum Sepolia for your miner’s address. After generating the key from `cortensord`, you can obtain test ETH from a public faucet or contact us, and we’ll send some test ETH on Arbitrum Sepolia.

## 1. Download

### 1a. Download Installer

```
$ curl -L https://github.com/cortensor/installer/archive/main.tar.gz -o cortensor-installer-latest.tar.gz
$ tar xzfv cortensor-installer-latest.tar.gz
$ cd installer
```

### 1b. Clone Installer

```
$ git clone https://github.com/cortensor/installer
$ cd installer
```

### Git for Windows User

```
1. Download Git for Windows Standalone Installer from official website
https://git-scm.com/downloads/win

2. double-click install-git.bat under installer\win-bat
```

## 2. Installation & Setup

### Linux - Ubuntu 22.04 & Debian 12

#### Install - Docker, IPFS & Cortensord

```
# Run it as 'root'
$ cd installer

# Install Docker for ubuntu 22.04
$ ./install-docker-ubuntu.sh

# Install Docker for debian
$ ./install-docker-debian.sh

# Install IPFS
$ ./install-ipfs-linux.sh

# Install Cortensord
$ ./install-linux.sh

# Copy installer folder to deploy home
$ cp -Rf ./installer /home/deploy/installer
$ chown -R deploy.deploy /home/deploy/installer

# Logoff or start another shell
$ sudo su deploy
$ cd ~/

# Verify installation
$ ls -al /usr/local/bin/cortensord
$ ls -al $HOME/.cortensor/bin/cortensord
$ ls -al /etc/systemd/system/cortensor.service
$ ls -al $HOME/.cortensor/bin/start-cortensor.sh
$ ls -al $HOME/.cortensor/bin/stop-cortensor.sh
$ docker version
$ ipfs version
```

#### Setup - Your address needs to be whitelisted in advance by Cortensor Admin

<pre><code><strong># switch account to 'deploy' which was created from previous install step
</strong>$ sudo su deploy
$ cd ~/

$ export PATH=$PATH:~/.cortensor/bin

#################################
# Using helper scripts
$ cd ./installer

# Generate Key for the node via script
$ ./utils/gen-key.sh

# Please contact Cortensor support or mod to whitelist your address
$ ./utils/register.sh
$ ./utils/verify.sh
 
or 

#################################
# Using direct commands

# Geenerate Key for the node
$ $HOME/.cortensor/bin/cortensord ~/.cortensor/.env tool gen_key

# Please contact Cortensor support or mod to whitelist your address
$ $HOME/.cortensor/bin/cortensord ~/.cortensor/.env tool register
$ $HOME/.cortensor/bin/cortensord ~/.cortensor/.env tool verify
</code></pre>

#### Start & Stop through SystemD

```
$ sudo su deploy
$ sudo systemctl start cortensor
$ sudo systemctl stop cortensor
```

#### Start MinerV2 Manually (With LLM engine docker)

```
$ sudo su deploy
$ export PATH=$PATH:~/.cortensor/bin
$ cd ~/.cortensor && cortensord ~/.cortensor/.env minerv2 1 docker

# or use script to start & stop
$ sudo su deploy
$ cd ~/.cortensor && ~/.cortensor/bin/start-cortensor.sh
$ cd ~/.cortensor && ~/.cortensor/bin/stop-cortensor.sh
```

#### Start MinerV2 Manually (With LLM engine as subprocess)

```
$ sudo su deploy
$ export PATH=$PATH:~/.cortensor/bin
$ cd ~/.cortensor && cortensord ~/.cortensor/.env minerv2
```

***

### OSX/Darwin - ARM64

#### Install - IPFS & Cortensord

```
$ cd installer

# Install IPFS
$ ./install-ipfs-osx.sh

# Install Cortensord
$ ./install-osx.sh

# Logoff or start another shell

# Verify installation
$ ls -al $HOME/.cortensor/bin/cortensord
$ ls -al $HOME/.cortensor/bin/start-cortensor.sh
$ ls -al $HOME/.cortensor/bin/stop-cortensor.sh
$ $HOME/.cortensor/bin/ipfs version
```

#### Setup - Your address needs to be whitelisted in advance by Cortensor Admin

```
$ cd ~/

$ export PATH=$PATH:~/.cortensor/bin

#################################
# Using helper scripts
$ cd ./installer

# Generate Key for the node via script
$ ./utils/gen-key.sh

# Please contact Cortensor support or mod to whitelist your address
$ ./utils/register.sh
$ ./utils/verify.sh
 
or 

#################################
# Using direct commands

# Geenerate Key for the node
$ $HOME/.cortensor/bin/cortensord ~/.cortensor/.env tool gen_key

# Please contact Cortensor support or mod to whitelist your address
$ $HOME/.cortensor/bin/cortensord ~/.cortensor/.env tool register
$ $HOME/.cortensor/bin/cortensord ~/.cortensor/.env tool verify
```

#### Start & Stop through start & stop scripts

```
$ $HOME/bin/start-cortensor.sh
$ $HOME/bin/stop-cortensor.sh
```

#### Start MinerV2Manually

```
$ cd ~/.cortensor && $HOME/bin/cortensord ~/.cortensor/.env minerv2
```

### Windows Cygwin - AMD64

#### Install - Git Bash & Python

```
1. Install Git for Windows

Download Git for Windows Standalone Installer from official website
https://git-scm.com/downloads/win

or double-click ./installer/win-bat/install-git.bat to install Git

2. Install Python 3.13 (Optional)
```

#### Install - IPFS & Cortensord

```
$ cd installer

# Install IPFS
$ ./install-ipfs-win-cygwin.sh

# Install Cortensord
$ ./install-win-cygwin.sh

# Logoff or start another cygwin shell

# Verify installation
$ ls -al $HOME/.cortensor/bin/cortensord
$ ls -al $HOME/.cortensor/start-cortensor.sh
$ ls -al $HOME/.cortensor/stop-cortensor.sh
$ $HOME/.cortensor/bin/ipfs version
```

#### Setup - Your address needs to be whitelisted in advance by Cortensor Admin

<pre><code>$ cd ~/

$ export PATH=$PATH:~/.cortensor/bin

#################################
# Using helper scripts
$ cd ./installer

# Generate Key for the node via script
$ ./utils/gen-key.sh

# Please contact Cortensor support or mod to whitelist your address
$ ./utils/register.sh
$ ./utils/verify.sh
 
or 

#################################
# Using direct commands

<strong># Geenerate Key for the node
</strong><strong>$ $HOME/.cortensor/bin/cortensord ~/.cortensor/.env tool gen_key
</strong><strong>
</strong><strong># Please contact Cortensor support or mod to whitelist your address
</strong>$ $HOME/.cortensor/bin/cortensord ~/.cortensor/.env tool register
$ $HOME/.cortensor/bin/cortensord ~/.cortensor/.env tool verify
</code></pre>

#### Start & Stop through start & stop scripts

```
$ $HOME/.cortensor/start-cortensor.sh
$ $HOME/.cortensor/stop-cortensor.sh
```

#### Start MinerV2 Manually - Run under deploy user account

```
$ export PATH=$PATH:~/.cortensor/bin
$ cd ~/.cortensor && $HOME/.cortensor/bin/cortensord ~/.cortensor/.env minerv2
```

### Windows Cygwin - AMD64 through BAT files

#### Install - Git Bash & Python

```
1. Install Git for Windows

Double-click ./installer/win-bat/install-git.bat to install Git

2. Install Python 3.13 (Optional)
```

#### Install - IPFS & Cortensord

```
# Install Cortensor
Double-click ./installer/win-bat/install-cortensor.bat

# Install IPFS
Double-click ./installer/win-bat/install-ipfs.bat

# There will be start-cortensor.bat on Desktop
```

#### Setup - Your address needs to be whitelisted in advance by Cortensor Admin

```
# Generate Key
Double-click ./installer/win-bat/gen-key.bat

# Register
Double-click ./installer/win-bat/register.bat

# Verify
Double-click ./installer/win-bat/verify.bat

# Start
Double-click start-cortensor.bat on Desktop
```

#### Start & Stop through start & stop scripts

```
$ $HOME/.cortensor/start-cortensor.sh
$ $HOME/.cortensor/stop-cortensor.sh
```

#### Start MinerV2 Manually - Run under deploy user account

```
$ export PATH=$PATH:~/.cortensor/bin
$ cd ~/.cortensor && $HOME/.cortensor/bin/cortensord ~/.cortensor/.env minerv2
```

### Enable GPU support

\
Update .env file to enable GPU support

```
# Update .env file to enable GPU support

# Update to 1
LLM_OPTION_GPU=1

# Leave to -1 as automatic mode or you can configure your threshold
# number of LLM layers to be offload to GPU
LLM_OPTION_GPU_THRESHOLD=-1

# To start with GPU support, you need to use subprocess for LLM engine
$ cortensord ~/.cortensor/.env minerv2
```

## 3. Upgrade

### Linux - Ubuntu 22.04 & Debian

<pre><code>$ sudo su deploy
$ cd installer
<strong>$ git pull
</strong>$ ./upgrade-linux.sh
</code></pre>

### OSX/Darwin - ARM64

```
$ cd installer
$ git pull
$ ./upgrade-osx.sh
```

### Windows Cygwin - AMD64

```
$ cd installer
$ git pull
$ ./upgrade-win-cygwin.sh
```

## Debugging & Troubleshoot

Kill IPFS process - Windows, OSX, Linux

```
$ sudo su deploy
$ cd ./installer
$ ./utils/kill-ipfs.sh
```

### Debugging & Troubleshoot (Linux)

\
Check Log

```
$ ls -alh /var/log/cortensord.log
$ tail -f /var/log/cortensord.log
```

Check Node Address & ID

```
$ export PATH=$PATH:~/.cortensor/bin
$ /usr/local/bin/cortensord ~/.cortensor/.env tool id
```

Check NodeStats

```
$ export PATH=$PATH:~/.cortensor/bin
$ /usr/local/bin/cortensord ~/.cortensor/.env tool stats
```

Kill IPFS process - Linux & OSX

```
$ pkill ipfs
```

***

## Contributions from Community Members

### Documentations from Community Members

* [https://logosnodos.medium.com/step-by-step-how-to-install-cortensor-mining-ai-155b625213cb](https://logosnodos.medium.com/step-by-step-how-to-install-cortensor-mining-ai-155b625213cb)
* [https://docs.aldebaranode.xyz/guide/testnet/cortensor/installation](https://docs.aldebaranode.xyz/guide/testnet/cortensor/installation)
* [https://docs.cryptonode.id/en/testnet/cortensor](https://docs.cryptonode.id/en/testnet/cortensor)
* [https://github.com/coinsspor/Cortensor-Ag-Uzerinde-Coklu-Node-Kurulum-Rehberi--Phase-3---Devnet-4](https://github.com/coinsspor/Cortensor-Ag-Uzerinde-Coklu-Node-Kurulum-Rehberi--Phase-3---Devnet-4)
* [https://docs.logosnodos.online/testnet-node/cortensor](https://docs.logosnodos.online/testnet-node/cortensor)

### Node Monitoring Bots

* [https://t.me/conomo\_bot](https://t.me/conomo_bot)
* [https://t.me/cortensormonitorbot](https://t.me/cortensormonitorbot)

### Node Watchdogs

* [https://github.com/scerb/node\_watch](https://github.com/scerb/node_watch/releases)
* [https://github.com/beranalpa/cortensor-watcher-bot](https://github.com/beranalpa/cortensor-watcher-bot)

### RPC Endpoints

* [https://forms.gle/D3cMJnLFZKQAvPL3A](https://forms.gle/D3cMJnLFZKQAvPL3A)
* [https://sepolia-arb-rpc.centertopup.com/](https://sepolia-arb-rpc.centertopup.com/)
* [https://arb-sep.scerb.uk/](https://arb-sep.scerb.uk/)

### Arbitrum Sepolia Faucet Bots

* [https://t.me/Cortensor\_Faucet\_Bot](https://t.me/Cortensor_Faucet_Bot)



**Disclaimer:** This page and the associated documents are currently a work in progress. The information provided may not be up to date and is subject to change at any time.
