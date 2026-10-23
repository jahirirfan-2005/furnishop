FROM php:8.2-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache rewrite and headers modules
RUN a2enmod rewrite headers

# Allow .htaccess overrides
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copy backend application into /var/www/html/backend
WORKDIR /var/www/html
COPY . /var/www/html/backend/

# Ensure uploads directory exists and is writable
RUN mkdir -p /var/www/html/backend/uploads/products && \
    chown -R www-data:www-data /var/www/html/backend/uploads && \
    chmod -R 775 /var/www/html/backend/uploads

EXPOSE 80

CMD ["apache2-foreground"]
