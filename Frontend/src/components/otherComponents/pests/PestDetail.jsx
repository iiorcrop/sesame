import { unsanitizeText } from "../../../../utils/textUtils";

const PestDetail = ({ pest }) => {
  if (!pest) {
    return (
      <div className="pest-content">
        <div className="loading-message">
          Please select a pest from the list
        </div>
      </div>
    );
  }
  console.log("pert image", pest.image);
  return (
    <div className="pest-content">
      <div className="pest-header">
        <h1>{pest.name}</h1>
      </div>

      <div className="flex flex-col lg:flex-row items-start">
        <div className="pest-image-container">
          {pest.image !== "/default-pest-image.jpg" && (
            <img
              src={pest.image}
              alt={`${pest.name} pest`}
              className="pest-image"
            />
          )}
        </div>

        <div className="pest-info">
          <table className="pest-info-table">
            <tbody>
              {Object.entries(pest.details).map(([key, value], index) => (
                <tr key={index}>
                  <td>{unsanitizeText(key)}</td>
                  <td
                    dangerouslySetInnerHTML={{ __html: unsanitizeText(value) }}
                  ></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PestDetail;
