from flask_restful import Resource, Api, reqparse, marshal_with, fields
from application.models import Section, db
from flask import jsonify

api = Api(prefix = '/api')

section_parser = reqparse.RequestParser()
section_parser.add_argument('name', type=str, required=True, help='Name cannot be blank...')
section_parser.add_argument('description', type=str, required=True, help="Description cannot be empty...")

section_resource_field = {
    "id" : fields.String,
    "name" : fields.String,
    "description" : fields.String,
    "date_created" : fields.String
}



class SectionResource(Resource):
    @marshal_with(section_resource_field)
    def get(self, section_id=None):
        if section_id:
            section = Section.query.get(section_id)
            if section:
                return {
                    'id' : section.id,
                    'name' : section.name,
                    'description' : section.description,
                    'date_created' : section.date_created.isoformat()  if section.date_created else None,
                     #'books' : [book.name for book in section.books] if section.books else []
                }
            else:
                return jsonify({"message": "Section not found"})
        else:
            sections = Section.query.all()
            result =  [{
                'id' : section.id,
                'name' : section.name,
                'description' : section.description,
                'date_created' : section.date_created.isoformat() if section.date_created else None,
                # "books" : [book.name for book in section.books] if section.books else []
            }for section in sections]
            return result

    
    def post(self):
        args = section_parser.parse_args()
        new_section = Section(name=args['name'], description=args['description'])
        db.session.add(new_section)
        db.session.commit()
        return {'message' : 'Section created Successfully...', 'id':new_section.id}, 201

    def delete(self, section_id):
        section = Section.query.get(section_id)
        if section:
            db.session.delete(section)
            db.session.commit()
            return {'message' : 'Section deleted successfully....'}
        else:
            return {'message' : 'Section not found...'}



api.add_resource(SectionResource, '/section', '/section/<int:section_id>')


