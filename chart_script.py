import plotly.graph_objects as go

# Define the architecture data with correct placement and colors
layers_data = [
    {
        "name": "Presentation",
        "services": ["AWS Amplify", "CloudFront", "S3", "Route 53"],
        "color": "#FF6B6B"
    },
    {
        "name": "API Layer", 
        "services": ["API Gateway", "Cognito", "IAM", "WAF"],
        "color": "#4ECDC4"
    },
    {
        "name": "Compute Layer",
        "services": ["Lambda", "Fargate", "Step Func", "EventBridge"],
        "color": "#45B7D1"
    },
    {
        "name": "Data Layer",
        "services": ["DynamoDB", "RDS Aurora", "S3", "Redshift", "OpenSearch"],
        "color": "#96CEB4"
    },
    {
        "name": "Integration",
        "services": ["SQS", "SNS", "Kinesis", "IoT Core"],
        "color": "#FECA57"
    },
    {
        "name": "AI/ML Layer", 
        "services": ["SageMaker", "Rekognition", "Comprehend", "Forecast"],
        "color": "#FF9FF3"
    },
    {
        "name": "Monitoring",
        "services": ["CloudWatch", "X-Ray", "SNS Alerts"],
        "color": "#54A0FF"
    }
]

fig = go.Figure()

# Layout parameters with better spacing
layer_height = 1.2
layer_spacing = 0.3
service_box_width = 1.6
service_box_height = 0.5
service_spacing = 0.4

# Calculate total height
total_height = len(layers_data) * (layer_height + layer_spacing)

# Draw layers from top to bottom
for i, layer in enumerate(layers_data):
    y_pos = total_height - i * (layer_height + layer_spacing)
    
    # Calculate layout for services
    services = layer["services"]
    services_per_row = min(4, len(services))
    rows_needed = (len(services) + services_per_row - 1) // services_per_row
    
    # Calculate total width for consistent layer backgrounds
    max_width = 4 * service_box_width + 3 * service_spacing
    
    # Draw full-width layer background
    layer_bg_height = rows_needed * service_box_height + (rows_needed - 1) * 0.3 + 0.8
    fig.add_shape(
        type="rect",
        x0=-max_width/2 - 0.5,
        y0=y_pos - layer_bg_height,
        x1=max_width/2 + 0.5,
        y1=y_pos + 0.2,
        fillcolor=layer["color"],
        opacity=0.2,
        line=dict(color=layer["color"], width=2)
    )
    
    # Add layer title
    fig.add_annotation(
        x=0,
        y=y_pos + 0.05,
        text=f"<b>{layer['name']}</b>",
        showarrow=False,
        font=dict(size=18, color="black"),
        xanchor="center",
        yanchor="top"
    )
    
    # Draw service boxes with better spacing
    for j, service in enumerate(services):
        row = j // services_per_row
        col = j % services_per_row
        
        # Center services in each row
        services_in_row = min(services_per_row, len(services) - row * services_per_row)
        row_width = services_in_row * service_box_width + (services_in_row - 1) * service_spacing
        row_start_x = -row_width / 2
        
        x_pos = row_start_x + col * (service_box_width + service_spacing)
        service_y_pos = y_pos - 0.5 - row * (service_box_height + 0.3)
        
        # Draw service box with better contrast
        fig.add_shape(
            type="rect",
            x0=x_pos,
            y0=service_y_pos - service_box_height,
            x1=x_pos + service_box_width,
            y1=service_y_pos,
            fillcolor=layer["color"],
            opacity=0.9,
            line=dict(color="white", width=3)
        )
        
        # Add service name with better visibility
        fig.add_annotation(
            x=x_pos + service_box_width/2,
            y=service_y_pos - service_box_height/2,
            text=f"<b>{service}</b>",
            showarrow=False,
            font=dict(size=12, color="white"),
            xanchor="center",
            yanchor="middle"
        )

# Update layout
fig.update_layout(
    title="HealthVital Serverless Architecture",
    xaxis=dict(visible=False),
    yaxis=dict(visible=False),
    showlegend=False,
    plot_bgcolor="white",
    paper_bgcolor="white"
)

# Set axis ranges to fit content properly
fig.update_xaxes(range=[-8, 8])
fig.update_yaxes(range=[-2, total_height + 1])

fig.write_image("healthvital_architecture.png")