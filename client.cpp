#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <queue>
#include <sys/stat.h>
#include <iostream>

using namespace std;

#define BUFSIZE 2048

int reach_end = 0;

int sockFD;
int main(int argc, char *argv[]){

  char ip[64], port[64];
  sscanf(argv[1], "%[^:]:%s", ip, port);

  
  char buf[BUFSIZE];
  bzero(buf, sizeof(buf));

  // Create Socket
  sockFD = socket(AF_INET, SOCK_STREAM, 0);

  struct sockaddr_in serverAddress;
  bzero(&serverAddress, sizeof(serverAddress));
  serverAddress.sin_family = PF_INET;
  serverAddress.sin_addr.s_addr = inet_addr(ip);
  serverAddress.sin_port = htons((unsigned short)atoi(port));

  // Connect
  int con_result = connect(sockFD, (struct sockaddr *)&serverAddress, sizeof(serverAddress));
  if (con_result == 0) {
    fprintf(stderr, "Connect to server!\n"); 
  } 
  else {
    fprintf(stderr, "Failed to connect to server.\n");
  }

  /* Create Folder */
  char folder_name[BUFSIZE];
  sprintf(folder_name, "client_dir");

  // Check whether if folder exists
  struct stat st;
  bzero(&st, sizeof(st));
  if (stat(folder_name, &st) == -1){
    mkdir(folder_name, 0777);
  }

  chdir(folder_name);

  // Read data from Socket
  int con_successful = 1;
  while (1){

    /* Username Input Part */
    char receiveMessage[100] = {};
    char username[12] = {};
    if (con_successful != 0) {
      printf("input your username:\n");
      while (1) {
          scanf(" %s", username);
          send(sockFD, username, sizeof(username), 0);
          recv(sockFD, receiveMessage, sizeof(receiveMessage), 0);
          printf("%s", receiveMessage);

          // exit condition: received "connect successfully\n"
          if (strcmp(receiveMessage, "connect successfully\n") == 0) { 
            con_successful = 0;
            break; 
          }

          memset(receiveMessage, '\0', 100);
          memset(username, '\0', 12);
      }
    }
    

    char commandLine[1000];
    // catch \n
    if (strcmp(receiveMessage, "connect successfully\n") == 0) { fgets(commandLine, sizeof(commandLine), stdin); }

    fgets(commandLine, sizeof(commandLine), stdin);
    char command[10];
    sscanf(commandLine, "%s", command);
    // printf("command [%s]\n", command);

    if (strncmp(command, "ls", 2) == 0){
      write(sockFD, command, sizeof(command));

      read(sockFD, buf, sizeof(buf));
      printf("%s", buf);
    }
    else if (strncmp(command, "put", 3) == 0){
      // char commandLine2[1000];
      // strcpy(commandLine2, commandLine+strlen(command));

      char *filename;
      filename = strtok(commandLine+strlen(command), " \n");


      // for (int i = 0; i <2; i++){
      while (filename != NULL){
        // char filename[1024];
        // scanf("%s", filename);
        FILE *fp = fopen(filename, "rb");
        if (fp == NULL){
          printf("The %s doesn’t exist.\n", filename);
          filename = strtok(NULL, " \n");
          continue;
        }
        // printf(" write command [%s]\n", command);
        write(sockFD, command, sizeof(command));
        // printf(" write filename [%s]\n", filename);
        write(sockFD, filename, 1024);

        
        fseek(fp, 0, SEEK_END);
        int file_size = ftell(fp);
        fseek(fp, 0, SEEK_SET);

        sprintf(buf,"%d", file_size);
        write(sockFD, buf, sizeof(buf));
        // printf("file_size %d buf %s\n", file_size, buf);

        while(!feof(fp)){
          int numbytes = fread(buf, sizeof(char), sizeof(buf), fp);
          numbytes = write(sockFD, buf, numbytes);
        }
        fclose(fp);
        printf("put %s successfully\n", filename);
        filename = strtok(NULL, " \n");
      }
      // return 0;
    }
    else if (strncmp(command, "get", 3) == 0){
      
      char *tmp;
      tmp = strtok(commandLine+strlen(command), " \n");

      // for (int i = 0; i < 3; i++){
      while (tmp != NULL){
        write(sockFD, command, sizeof(command));
        char filename[1024];
        // scanf("%s", filename);
        strcpy(filename, tmp);
        write(sockFD, filename, sizeof(filename));

        read(sockFD, buf, sizeof(buf));
        // printf("check: %s\n", buf);
        if (strncmp(buf, "NO", 2) == 0){
          printf("The %s doesn’t exist\n", filename);
          tmp = strtok(NULL, " \n");
          continue;
        }

        FILE *fp = fopen(filename, "wb");
        if (fp == NULL){
          perror("something wrong\n");
          exit(-1);
        }
        
        read(sockFD, buf, sizeof(buf));
        size_t file_size = atoi(buf);

        int total = 0;
        while(1){
          int numbytes = read(sockFD, buf, sizeof(buf));
          numbytes = fwrite(buf, sizeof(char), numbytes, fp);

          total += numbytes;
          if (total == file_size)
            break;
        }
        // printf("total %d\n", total);
        printf("get %s successfully\n", filename);
        fclose(fp);

        tmp = strtok(NULL, " \n");
      } 

    }
    else if (strncmp(command, "quit", 4) == 0){
      write(sockFD, command, sizeof(command));
      close(sockFD);
      return 0;
    }
    else {
      printf("Command not found\n");
    }
    // printf("command %s reach_end\n\n", command);
  }

  close(sockFD);
}
