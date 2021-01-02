# Updated Minikube Install and Setup Info - macOS

updated 8-4-2020

## Install

In the upcoming lecture, Stephen will setup and install Minikube using Homebrew. The installation instructions have changed slightly.

Instead of running:

brew cask install minikube

We only need to run:

brew install minikube

## Driver Options

Minikube now supports the use of many different drivers. Hyperkit is the current recommended default for macOS. If you do not have Docker Desktop installed, then you may need to install it using Homebrew:

brew install hyperkit

To start minikube with hyperkit:

minikube start --driver=hyperkit

To set Hyperkit as the default driver:

minikube config set driver hyperkit

Find the IP address of your cluster:

minikube ip

## Docker Driver - Important

Currently, the docker driver is not supported for use in this course. It currently does not work with any type of ingress:

https://minikube.sigs.k8s.io/docs/drivers/docker/#known-issues
