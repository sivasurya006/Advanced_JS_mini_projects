drop database if exists ciphersafe;

create database ciphersafe;
use ciphersafe;


create table users (
    id binary(16) primary key,              
    name varchar(50) not null,
    email varchar(256) unique not null,
    password_hash varchar(60) not null,     
    created_at timestamp default current_timestamp,
    storage_allowed boolean not null default false
);

create table files (
    id binary(16) primary key,              
    user_id binary(16) not null,            
    original_filename varchar(255) not null, 
    created_at timestamp default current_timestamp,
    foreign key (user_id) references users(id) on delete cascade
);


-- log table
create table logs (
    id binary(16) primary key,               
    user_id binary(16),                  
    file_id binary(16),                  
    action varchar(50) not null,              
    ip_address varchar(45) null,              
    created_at timestamp default current_timestamp,

    foreign key (user_id) references users(id) on delete set null,
    foreign key (file_id) references files(id) on delete set null
);

