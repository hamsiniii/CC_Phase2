from flask import Flask, request, jsonify
from datetime import datetime
from app import create_app, db
from app.models.models import User, Event, RSVP, Share, Request  # Import the Request model

app = create_app()  # Initialize the app from factory

@app.route('/')
def index():
    return 'Request Handling API is running!'

# 🔐 Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }), 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401
    

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    # Basic validation
    if not name or not email or not password or not role:
        return jsonify({'error': 'All fields are required'}), 400

    # Check if the user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

    # Create user and set password properly
    new_user = User(name=name, email=email, role=role)
    new_user.set_password(password)

    # Save to database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'User registered successfully',
        'user_id': new_user.id,
        'role': new_user.role
    }), 201


# 📥 User submits request
@app.route('/user/request', methods=['POST'])
def submit_request():
    data = request.get_json()
    print("📥 Incoming JSON:", data)  # Log input data

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    title = data.get('title')
    description = data.get('description')
    category = data.get('category')
    requested_by = data.get('requested_by')

    # Validate required fields
    if not title or not description or not category or requested_by is None:
        print("❌ Missing required fields.")
        return jsonify({'error': 'All fields are required'}), 400

    # Ensure requested_by is an integer
    try:
        requested_by = int(requested_by)
    except (ValueError, TypeError):
        print("❌ requested_by is not a valid integer.")
        return jsonify({'error': 'Invalid user ID'}), 400

    # Confirm user exists
    user = db.session.get(User, requested_by)
    if not user:
        print(f"❌ No user found with ID {requested_by}")
        return jsonify({'error': 'User not found'}), 400

    # Create and save request
    new_request = Request(
        title=title,
        description=description,
        category=category,
        requested_by=user.id
    )

    db.session.add(new_request)
    db.session.commit()

    print("✅ Request submitted successfully.")
    return jsonify({'message': 'Request submitted successfully'}), 201
@app.route('/user/requests/<int:user_id>', methods=['GET'])
def get_user_requests(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    requests = Request.query.filter_by(requested_by=user_id).order_by(Request.created_at.desc()).all()
    request_list = [
        {
            'id': r.id,
            'title': r.title,
            'description': r.description,
            'category': r.category,
            'status': r.status,
            'created_at': r.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        for r in requests
    ]

    return jsonify(request_list), 200




# 🔍 Admin gets requests
@app.route('/admin/requests', methods=['GET'])
def get_requests():
    user_id = request.args.get('user_id')
    user = User.query.get(user_id)

    if user and user.role == 'admin':
        requests = Request.query.all()
        return jsonify([{
            'id': req.id,
            'title': req.title,
            'description': req.description,
            'category': req.category,
            'status': req.status,
            'admin_comment': req.admin_comment,
            'requested_by': req.requested_by,
            'created_at': req.created_at
        } for req in requests]), 200
    else:
        return jsonify({'error': 'Unauthorized access'}), 403

# ✅ Admin updates status
@app.route('/admin/request/<int:request_id>/update', methods=['PUT'])
def update_request_status(request_id):
    data = request.get_json()
    status = data.get('status')  # should be 'approved' or 'denied'
    admin_comment = data.get('admin_comment')

    if status not in ['approved', 'denied']:
        return jsonify({'error': 'Invalid status'}), 400

    req = Request.query.get(request_id)

    if req:
        req.status = status
        req.admin_comment = admin_comment
        db.session.commit()
        return jsonify({'message': f'Request {status} successfully'}), 200
    else:
        return jsonify({'error': 'Request not found'}), 404

# 🚀 Initialize dummy data (only once after creating the app)
with app.app_context():
    # Create all tables
    db.create_all()

    # Insert dummy users (only once)
    if not User.query.first():
        # Users with passwords
        admin = User(name="Alice", email="alice@admin.com", role="admin")
        admin.set_password("adminpass")

        student1 = User(name="Bob", email="bob@student.com", role="student")
        student1.set_password("bobpass")

        student2 = User(name="Carol", email="carol@student.com", role="student")
        student2.set_password("carolpass")

        student3 = User(name="Dave", email="dave@student.com", role="student")
        student3.set_password("davepass")

        db.session.add_all([admin, student1, student2, student3])
        db.session.commit()

        # Events
        event1 = Event(title="Tech Talk", description="A talk on AI", date=datetime(2025, 4, 15), created_by=admin.id)
        event2 = Event(title="Workshop", description="ML Workshop", date=datetime(2025, 4, 18), created_by=admin.id)
        event3 = Event(title="Hackathon", description="24hr Hack", date=datetime(2025, 5, 1), created_by=admin.id)
        event4 = Event(title="Seminar", description="Industry experts", date=datetime(2025, 4, 22), created_by=admin.id)

        db.session.add_all([event1, event2, event3, event4])
        db.session.commit()

        # RSVPs
        rsvp1 = RSVP(user_id=student1.id, event_id=event1.id)
        rsvp2 = RSVP(user_id=student2.id, event_id=event1.id)
        rsvp3 = RSVP(user_id=student3.id, event_id=event2.id)
        rsvp4 = RSVP(user_id=student1.id, event_id=event3.id)

        db.session.add_all([rsvp1, rsvp2, rsvp3, rsvp4])
        db.session.commit()

        # Shares
        share1 = Share(user_id=student1.id, event_id=event1.id)
        share2 = Share(user_id=student2.id, event_id=event2.id)
        share3 = Share(user_id=student3.id, event_id=event3.id)
        share4 = Share(user_id=student1.id, event_id=event4.id)

        db.session.add_all([share1, share2, share3, share4])
        db.session.commit()

        # Dummy requests
        request1 = Request(
            title="Leave Request",
            description="I would like to take a leave for personal reasons.",
            category="Leave",
            requested_by=student1.id
        )
        request2 = Request(
            title="Event Participation",
            description="I would like to participate in the Tech Talk event.",
            category="Event",
            requested_by=student2.id
        )

        db.session.add_all([request1, request2])
        db.session.commit()

# 🚀 Start the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
