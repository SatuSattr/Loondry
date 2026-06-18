FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    git \
    nginx \
    nodejs \
    npm \
    zip \
    unzip \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    dom \
    xml \
    zip

# Install Composer
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Set working directory to /var/www/html
WORKDIR /var/www/html

# Copy the API source files from the apps/api subdirectory in the monorepo
COPY apps/api /var/www/html

# Create Laravel storage structure and set permissions
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

# Use the Docker environmental variables configuration
RUN cp .env.docker .env

# Install backend dependencies
RUN composer install --no-dev --optimize-autoloader

# Install frontend dependencies and compile assets
RUN npm install --no-dev && npm run build

# Generate app key and link public storage
RUN php artisan key:generate && php artisan storage:link

# Configure Nginx and Entrypoint script
COPY apps/api/docker/nginx.conf /etc/nginx/http.d/default.conf
COPY apps/api/docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose Nginx port
EXPOSE 80

# Execute entrypoint script
ENTRYPOINT ["entrypoint.sh"]
