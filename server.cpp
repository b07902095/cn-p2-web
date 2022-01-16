#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <sys/socket.h>
#include <fcntl.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <dirent.h>
#include <sys/stat.h>
#include <fstream> 
#include <iostream>


#define ERR_EXIT(a) { perror(a); exit(1); }
#define MAXSIZE 1555200
#define ROTATE_SIZE 10

typedef struct {
    char hostname[512];  // server's hostname
    unsigned short port;  // port to listen
    int listen_fd;  // fd to wait for a new connection
} server;

server svr;  // server
static void init_server(unsigned short port);

#define BUFSIZE 2048
char buf[BUFSIZE];
int playing[ROTATE_SIZE] = {0};

int main(int argc, char *argv[]) {
    // signal(SIGPIPE,SIG_IGN);
    if (argc != 2) {
        fprintf(stderr, "usage: %s [port]\n", argv[0]);
        exit(1);
    }
    init_server((unsigned short) atoi(argv[1]));
    int max_FD = getdtablesize();
    fprintf(stderr, "starting on %.80s, port %d, fd %d, maxconn %d...\n", svr.hostname, svr.port, svr.listen_fd, max_FD);
    
    fd_set rset; 
    FD_ZERO(&rset);
    FD_SET(svr.listen_fd, &rset);

    struct stat st;
    bzero(&st, sizeof(st));
    if (stat("./server_dir", &st) < 0)
    {
        if (mkdir("./server_dir", 0700) < 0)
        {
            ERR_EXIT("mkdir failed");
        }
    }
    chdir("./server_dir");

    // init message
    char input_buffer[256] = {};
    char message[100] = {};

    // init user DB
    char *usernames[100];
    int user_count = 0;
    usernames[user_count] = (char *)malloc(12 * sizeof(char));

    while (1) {
        // Add IO multiplexing
        fd_set rsetCopy;
        rsetCopy = rset;
    
        // printf("HERE1\n" );
        // fflush(stdout);
        select(max_FD, &rsetCopy, NULL, NULL, NULL);
        // printf("HERE2\n");
        // fflush(stdout);


        if (FD_ISSET(svr.listen_fd, &rsetCopy)){
            struct sockaddr_in cliaddr;
            int client;
            int conn_fd = accept(svr.listen_fd, (struct sockaddr*)&cliaddr, (socklen_t*)&client);

            /* Username Part */
            // check received username from client
            int valid_username = 1;
            while (1){
                fprintf(stderr, "Received Client Handshaking!\n");
                recv(conn_fd, input_buffer, sizeof(input_buffer), 0);
                fprintf(stderr, "Get username: %s\n", input_buffer);
                // check if username exists
                for (int i = 0; i <= 100; i++) {
                    if (i < user_count && strcmp(usernames[i], input_buffer) == 0) {
                        strcpy(message, "username is in used, please try another:\n");
                        break;
                    }
                    else if (i >= user_count) {
                        user_count++;
                        usernames[user_count] = (char *)malloc(12 * sizeof(char));
                        strcpy(usernames[user_count-1], input_buffer);
                        fprintf(stderr, "%s\n", usernames[user_count-1]);
                        strcpy(message, "connect successfully\n");
                        valid_username = 0;
                        break;
                    }
                }

                // send response of username result
                send(conn_fd, message, sizeof(message), 0);
                memset(message, '\0', 100);
                memset(input_buffer, '\0', 256);

                // exit condition: when found valid username
                if (valid_username == 0) { break; }
            }

            // add server fd into the set
            FD_SET(conn_fd, &rset);
            continue;
        }
        
        
        for (int i = svr.listen_fd + 1; i < max_FD; i++){
            // std::cout << "loop: " << i << '\n';
            if (!FD_ISSET(i, &rsetCopy))
                continue;
            int conn_fd = i;

            if (conn_fd >= 10) { continue; }
            if (playing[conn_fd]){
                int ha;
                read(conn_fd, &ha, sizeof(int));

                continue;
            }

          

            char command[10];
            int ret = read(conn_fd, command, sizeof(command));
            printf("command: \"%s\"\n", command);
            if (strncmp(command, "msg", 3) == 0){
                struct dirent **dir;
                buf[0] = '\0';
                int total, cnt = 0;
                total = scandir(".", &dir, NULL, alphasort);
                if (total < 0)
                    perror("scandir");
                else {
                    while (cnt < total) {
                        fprintf(stderr, "buffername: %s\n", dir[cnt]->d_name);
                        if (strcmp(dir[cnt]->d_name, ".") != 0 && strcmp(dir[cnt]->d_name, "..") != 0) {
                            strcat(buf, dir[cnt]->d_name);
                            strcat(buf, "\n");
                        }
                        free(dir[cnt]);
                        ++cnt;
                    }
                    free(dir);
                }

                write(conn_fd, buf, sizeof(buf));
                printf("%s", buf);
            }
            else if (strncmp(command, "pic", 3) == 0){
                char filename[1024];
                int ret = read(conn_fd, filename, sizeof(filename));
                printf(" filename in server [%s]\n", filename);
                FILE *fp = fopen(filename, "wb");
                if (fp == NULL){
                    printf("something wrong\n");
                    continue;
                }
              
                read(conn_fd, buf, sizeof(buf));
                size_t file_size = atoi(buf);

                int total = 0;
                while(1){
                    int numbytes;
                    if (file_size - total < sizeof(buf))
                        numbytes = read(conn_fd, buf, file_size - total);
                    else
                        numbytes = read(conn_fd, buf, sizeof(buf));

                    numbytes = fwrite(buf, sizeof(char), numbytes, fp);
                    total += numbytes;
                    printf("in while total %d numbytes %d file_size %ld\n", total, numbytes, file_size);
                    if (total == file_size)
                        break;

                }
                printf("total %d\n", total);
                fclose(fp);
            }
            else if (strncmp(command, "file", 4) == 0){
                char filename[1024];
                int ret = read(conn_fd, filename, sizeof(filename));
                printf("filename: %s\n", filename);
                FILE *fp = fopen(filename, "rb");
                if (fp == NULL){
                    fprintf(stderr, "file not found!!\n\n");
                    sprintf(buf, "NO");
                    write(conn_fd, buf, sizeof(buf));
                    continue;
                }
                else {
                	fprintf(stderr, "file exit~\n");
                	sprintf(buf, "OK");
                    write(conn_fd, buf, sizeof(buf));
                }
                

                fseek(fp, 0, SEEK_END);
                int file_size = ftell(fp);
                fseek(fp, 0, SEEK_SET);

                sprintf(buf,"%d", file_size);
                write(conn_fd, buf, sizeof(buf));
                printf("file_size %d buf %s\n", file_size, buf);

                while(!feof(fp)){
                    int numbytes = fread(buf, sizeof(char), sizeof(buf), fp);
                    numbytes = write(conn_fd, buf, numbytes);
                }
                fclose(fp);
            }
            else if (strncmp(command, "quit", 4) == 0){
            	FD_CLR(conn_fd, &rset);
            	close(conn_fd);

            }
            else {
                printf("wrong!!\n");
                exit(-1);
            }
            printf("%d end\n\n", conn_fd);
        }
    }
    return 0;
}

// Build tcp
static void init_server(unsigned short port) {
    
    struct sockaddr_in servaddr;
    int tmp;

    gethostname(svr.hostname, sizeof(svr.hostname));
    svr.port = port;

    svr.listen_fd = socket(AF_INET, SOCK_STREAM, 0);
    char lang[] = "python3";
    if (svr.listen_fd < 0) ERR_EXIT("socket");

    bzero(&servaddr, sizeof(servaddr));
    servaddr.sin_family = AF_INET;
    servaddr.sin_addr.s_addr = htonl(INADDR_ANY);
    servaddr.sin_port = htons(port);
    tmp = 1;
    execlp(lang, lang, "./cpp_module/crow/examples/app_fake.py", (char*) NULL);
    if (setsockopt(svr.listen_fd, SOL_SOCKET, SO_REUSEADDR, (void*)&tmp, sizeof(tmp)) < 0) {
        ERR_EXIT("setsockopt");
    }
    if (bind(svr.listen_fd, (struct sockaddr*)&servaddr, sizeof(servaddr)) < 0) {
        ERR_EXIT("bind");
    }
    if (listen(svr.listen_fd, 1024) < 0) {
        ERR_EXIT("listen");
    }
}
