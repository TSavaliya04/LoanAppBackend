using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using LoanPortal.API.Middleware;
using LoanPortal.API.Models;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using LoanPortal.Infrastructure;
using LoanPortal.Infrastructure.Models;
using LoanPortal.Infrastructure.Repositories;
using LoanPortal.Infrastructure.Services;
using LoanPortal.Shared;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);
var CORS_POLICY = "CorsPolicy";


builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://securetoken.google.com/notification-test-f7410";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = "https://securetoken.google.com/notification-test-f7410",
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidAudience = "notification-test-f7410",
            ValidateLifetime = true,
        };
    });

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpClient();
builder.Services.AddSwaggerGen();

//for use environment variables 
builder.Configuration.AddEnvironmentVariables();


// Register HttpClientService
builder.Services.AddScoped<IHttpClientService, HttpClientService>();

BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
//builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
var mongoSettings = builder.Configuration.GetSection("MongoDbSettings");
builder.Services.Configure<MongoDbSettings>(options =>
{
    options.ConnectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING") ?? (mongoSettings != null ? mongoSettings["ConnectionString"] : "");
    options.DatabaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME") ?? (mongoSettings != null ? mongoSettings["DatabaseName"] : "");
    options.PreApprovalCollectionName = Environment.GetEnvironmentVariable("MONGODB_PRE_APPROVAL_COLLECTION_NAME") ?? (mongoSettings != null ? mongoSettings["PreApprovalCollectionName"] : "");
    options.UserCollectionName = Environment.GetEnvironmentVariable("MONGODB_USER_COLLECTION_NAME") ?? (mongoSettings != null ? mongoSettings["UserCollectionName"] : "");
});
builder.Services.Configure<SMTPConfigModel>(builder.Configuration.GetSection("SMTPConfig"));
builder.Services.Configure<BlobStorageSettings>(builder.Configuration.GetSection("BlobStorageSettings"));



builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});
builder.Services.AddSingleton<MongoDbContext>();

builder.Services.AddSingleton<DataContext>();
builder.Services.AddSingleton<IUnitOfWork, UnitOfWork>();
builder.Services.AddSingleton<ILoginUserDetails, LoginUserDetails>();

builder.Services.AddSingleton<IPreApprovalService, PreApprovalService>();
builder.Services.AddSingleton<IPreApprovalRepository, PreApprovalRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddSingleton<IUserHelper, UserHelper>();
builder.Services.AddSingleton<IBlobStorageHelper, BlobStorageHelper>();
builder.Services.AddScoped<IFirebaseAuthService, FirebaseAuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "LoanPortal API ",
            Version = "v1",
            Description = string.Format(
                "Build Number:{0}",
                builder.Configuration.GetSection("BuildId").Value ?? string.Empty
            ),
        }
    );

    c.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Description =
                @"JWT Authorization header using the Bearer scheme. \r\n\r\n 
                          Enter 'Bearer' [space] and then your token in the text input below.
                          \r\n\r\nExample: 'Bearer 12345abcdef'",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            BearerFormat = "JWT",
            Scheme = "Bearer",
        }
    );

    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement()
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                    Scheme = "oauth2",
                    Name = "Bearer",
                    In = ParameterLocation.Header,
                },
                new List<string>()
            },
        }
    );
});

FirebaseModel firebaseModel = new FirebaseModel();
var firebaseSection = builder.Configuration.GetSection("FireBaseSettings");
firebaseModel.type = firebaseSection["type"] ?? Environment.GetEnvironmentVariable("FIREBASE_TYPE");
firebaseModel.project_id = firebaseSection["project_id"] ?? Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID");
firebaseModel.private_key_id = firebaseSection["private_key_id"] ?? Environment.GetEnvironmentVariable("FIREBASE_PRIVATE_KEY_ID");
firebaseModel.private_key = firebaseSection["private_key"] ??
    Environment.GetEnvironmentVariable("FIREBASE_PRIVATE_KEY")?.Replace("\\n", "\n");

//firebaseModel.private_key = firebaseSection["private_key"] ?? Environment.GetEnvironmentVariable("FIREBASE_PRIVATE_KEY");
firebaseModel.client_email = firebaseSection["client_email"] ?? Environment.GetEnvironmentVariable("FIREBASE_CLIENT_EMAIL");
firebaseModel.client_id = firebaseSection["client_id"] ?? Environment.GetEnvironmentVariable("FIREBASE_CLIENT_ID");
firebaseModel.auth_uri = firebaseSection["auth_uri"] ?? Environment.GetEnvironmentVariable("FIREBASE_AUTH_URI");
firebaseModel.token_uri = firebaseSection["token_uri"] ?? Environment.GetEnvironmentVariable("FIREBASE_TOKEN_URI");
firebaseModel.auth_provider_x509_cert_url = firebaseSection["auth_provider_x509_cert_url"] ?? Environment.GetEnvironmentVariable("FIREBASE_AUTH_PROVIDER_CERT_URL");
firebaseModel.client_x509_cert_url = firebaseSection["client_x509_cert_url"] ?? Environment.GetEnvironmentVariable("FIREBASE_CLIENT_CERT_URL");


FirebaseApp.Create(
    new AppOptions
    {
        Credential = GoogleCredential.FromJson(JsonConvert.SerializeObject(firebaseModel)),
    }
);

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: CORS_POLICY,
        cbuilder =>
        {
            cbuilder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            //builder.AllowAnyOrigin();
            //builder.AllowAnyMethod();
            //builder.AllowAnyHeader();
        }
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

app.UseCors(CORS_POLICY);
app.UseMiddleware<ErrorHandlerMiddleware>();
app.UseMiddleware<JwtMiddleware>();

app.Use(
    async (context, next) =>
    {
        context.Response.Headers.Add(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self';"
        );
        context.Response.Headers.Add("X-Frame-Options", "DENY");
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Add(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains; preload"
        );

        await next();
    }
);

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
