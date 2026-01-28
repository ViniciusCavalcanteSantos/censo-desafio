FROM ubuntu:22.04

WORKDIR /var/www/html

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    software-properties-common \
    curl \
    zip \
    unzip \
    git \
    && add-apt-repository ppa:ondrej/php -y \
    && apt-get update

RUN apt-get install -y \
    php7.0-cli \
    php7.0-common \
    php7.0-json \
    php7.0-mysql \
    php7.0-mbstring \
    php7.0-mcrypt \
    php7.0-zip \
    php7.0-xml \
    php7.0-curl \
    php7.0-gd

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]