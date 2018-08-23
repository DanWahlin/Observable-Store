FROM nginx:alpine
LABEL author="Dan Wahlin"
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf

# Use the following commands to build the image and run the container (run from the root folder)
# 1. You'll first need to build the project using `npm run build`

# 2. Now build the Docker image:
# docker build -t nginx-react -f nginx.dockerfile .

#3. Run the Docker container:
# To run the container we'll create a volume to point to our local source code. On Mac
# you can use $(pwd) to reference your local folder where your running Docker commands from.
# If you're on Windows there are several options to point to the folder. See my following post:
# https://blog.codewithdan.com/2017/10/25/docker-volumes-and-print-working-directory-pwd/

# docker run -p 8080:80 -v $(pwd)/build:/usr/share/nginx/html nginx-react