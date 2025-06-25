# Build stage
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy the solution and project files
COPY ["LoanPortal.sln", "./"]
COPY ["src/LoanPortal.API/LoanPortal.API.csproj", "src/LoanPortal.API/"]
COPY ["src/LoanPortal.Core/LoanPortal.Core.csproj", "src/LoanPortal.Core/"]
COPY ["src/LoanPortal.Infrastructure/LoanPortal.Infrastructure.csproj", "src/LoanPortal.Infrastructure/"]
COPY ["src/LoanPortal.Shared/LoanPortal.Shared.csproj", "src/LoanPortal.Shared/"]
COPY ["tests/LoanPortal.Tests/LoanPortal.Tests.csproj", "tests/LoanPortal.Tests/"]

# Restore NuGet packages
RUN dotnet restore

# Copy the rest of the source code
COPY . .

# Build and publish the application
RUN dotnet build "src/LoanPortal.API/LoanPortal.API.csproj" -c Release -o /app/build
RUN dotnet publish "src/LoanPortal.API/LoanPortal.API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port 80
EXPOSE 80

# Start the application
ENTRYPOINT ["dotnet", "LoanPortal.API.dll"] 