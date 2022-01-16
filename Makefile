# Makefile for client and server

all:
	g++ -std=c++11 server.cpp -o server
	g++ -std=c++11 client.cpp -o client

client: client.o
	g++ client.o -o client
	rm -f client.o
client.o: client.cpp
	g++ client.cpp -c
server: server.o
	g++ server.o -o server
	rm -f server.o
server.o: server.cpp
	g++ server.cpp -c

clean:
	rm -rf client.o server.o client server
	rm -rf ./client_dir
	rm -rf ./server_dir
