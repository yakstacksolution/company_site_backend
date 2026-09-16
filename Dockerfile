FROM php:8.3-cli-alpine

WORKDIR /app

RUN apk add --no-cache bash curl git icu-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install intl mbstring pdo pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-scripts --no-autoloader

COPY . .
RUN composer dump-autoload --optimize \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -fsS http://127.0.0.1:8000/api/ready || exit 1
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
