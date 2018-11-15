// #include <cstdio>
// #include <iostream>
// #include <vector>

// #define _LINE_LENGTH 300

// int main(void) 
// {

//     // FILE *fp = fopen("/Users/cry4tal/Desktop/GitLab/FaceMagicResource/sprite/wing/wing_000.png", "rb");
//     FILE *fp = fopen("/Users/cry4tal/Downloads/liuyifei.yuv", "rb");
//     std::vector<unsigned char> data;
//     int size = 0;
//     if(fp)
//     {
//         fseek(fp, 0, SEEK_END);
//         size = ftell(fp);
//         fseek(fp, 0, SEEK_SET);
//         data.resize(size);
//         fread(data.data(), size, 1, fp);
//         fclose(fp);
//     }

//     FILE *file;
//     char line[_LINE_LENGTH];
//     // ffmpeg -f image2pipe -i - output.h264
//     // –s w*h –pix_fmt yuv420p

//     // ffmpeg -s 720*1280 -pix_fmt yuv420p -i liuyifei.yuv output.mp4

//     file = popen("ffmpeg -f rawvideo -r 20 -s 720*1280 -pix_fmt yuv420p -i - -y /Users/cry4tal/Downloads/oup.mp4", "w");
//     // file = popen("ffmpeg -loop 1 -f image2pipe -i - -y -r 20 -vcodec h264 /Users/cry4tal/Downloads/oup.mp4", "w");
    
//     if (NULL != file)
//     {
//         for (int i = 0; i < 100; ++i)
//         {
//             /* code */
//             fwrite(data.data(), sizeof(char), size, file);
//             fflush(file);
//         }
        
//     }
//     else
//     {
//         return 1;
//     }
//     pclose(file);
//     return 0;
// }


#include <stdio.h>
#include <unistd.h>
#include <fstream>
#include <string.h>
#include <sstream>
#include <iostream>

using namespace std;

int main()
{
    // 0 输入 1 输出
    // int fd[2];
    // pipe(fd);
    // pid_t pid;
    // if ((pid = fork()) < 0)
    // {
    //     // failed
    // }
    // close(fd[1]);
    std::string arg = "ffmpeg -f rawvideo -s 720*1280 -pix_fmt yuv420p -i pipe:0 -y x2.mp4 > /Users/cry4tal/Downloads/o.mp4.log 2>&1";
    FILE* fp = popen(arg.c_str(), "w");

    if (fp == nullptr)
    {
        /* code */
        printf("fp is null\n");
        return 0;
    }
    // 写入数据
    fstream file("liuyifei.yuv", fstream::binary | fstream::in);
    if(!file.good())
        return 0;

    file.seekg(0, fstream::end);
    auto len = (unsigned)file.tellg();
    file.seekg(fstream::beg);

    stringstream ss;
    ss << file.rdbuf();
    const auto& s = ss.str();

    for (int i = 0; i < 100; ++i)
    {
        /* code */
        fwrite(s.data(), 1, s.size(), fp);
    }
    
//     char   buf[1024]; 
//     memset( buf, '/0', sizeof(buf) );//初始化buf,以免后面写如乱码到文件中
//     FILE *wstream = fopen("output.png", "w+"); //新建一个可写的文件

//     fread( buf, sizeof(char), sizeof(buf), fp);  //将刚刚FILE* stream的数据流读取到buf中
//     fwrite( buf, 1, sizeof(buf), wstream );//将buf中的数据写到FILE    *wstream对应的流中，也是写到文件中

    fclose(fp);
    return 0;
}