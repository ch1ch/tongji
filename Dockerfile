FROM registry.xiaoman.com/gulp
ENV HTTP_PORT 3020
COPY . /app
WORKDIR /app
EXPOSE 3020
CMD ["gulp"]